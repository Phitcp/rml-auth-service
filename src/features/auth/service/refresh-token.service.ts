import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenError } from '@auth/interface/error.response';
import { AppContext } from '@shared/decorator/context.decorator';
import { AppLogger } from '@shared/logger';
import { basename } from 'path';
import { GetUserTokenQueryDto, LogOutRequestDto } from '@auth/dto/request.dto';
import { RotateTokenResponseDto } from '@auth/dto/response.dto';
@Injectable()
export class RefreshTokenService {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private jwtService: JwtService,
    private appLogger: AppLogger,
  ) {}
  async issueTokenPair({ userId }) {
    const refreshToken = v4();
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '5m' });
    return {
      accessToken,
      refreshTokenInfo: {
        refreshToken,
        tokenHash,
        expiresAt,
      },
    };
  }

  async rotateToken(
    context: AppContext,
    { userId, sessionId, refreshToken },
  ): Promise<RotateTokenResponseDto> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('rotateToken');
    this.appLogger.log(`WILL rotate token for user ${userId}`);

    const record = await this.refreshTokenRepository.findOne({
      userId,
      sessionId,
    });
    if (!record) {
      throw new RefreshTokenError('No token found');
    }

    const validToken = await bcrypt.compare(refreshToken, record.tokenHash);
    if (!validToken) {
      throw new RefreshTokenError('Invalid token');
    }

    const checkUsedTokenResult = await Promise.all(
      record.usedTokenHashes.map((token) =>
        bcrypt.compare(refreshToken, token),
      ),
    );
    if (checkUsedTokenResult.some((item) => item)) {
      await this.refreshTokenRepository.deleteMany({ userId });
      this.appLogger.error(
        `FAILED rotate token for user ${userId}: rotate an used token detected`,
      );
      throw new RefreshTokenError('Invalid credential, please login again');
    }

    const isTokenExpired = record.expiresAt < new Date();
    if (isTokenExpired) {
      await this.refreshTokenRepository.deleteMany({ userId });
      this.appLogger.error(
        `FAILED rotate token for user ${userId}: rotate an expired token`,
      );
      throw new RefreshTokenError('Refresh token expired, please login again');
    }

    const { accessToken, refreshTokenInfo } = await this.issueTokenPair({
      userId,
    });

    record.usedTokenHashes.push(record.tokenHash);
    record.expiresAt = refreshTokenInfo.expiresAt;
    record.tokenHash = refreshTokenInfo.tokenHash;

    await record.save();
    this.appLogger.log(`DID rotate token for user ${userId}: successfully`);
    return {
      accessToken,
      refreshToken: refreshTokenInfo.refreshToken,
      sessionId,
    };
  }

  async revokeAllToken(context: AppContext, { userId }) {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('revokeToken');

    this.appLogger.log(`WILL revoke token for user ${userId}`);
    await this.refreshTokenRepository.deleteMany({ userId });
    this.appLogger.log(`DID revoke token for user ${userId}`);

    return true;
  }

  async getTokenForUser(context: AppContext, { userId }: GetUserTokenQueryDto) {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('getTokenForUser');
    this.appLogger.log(`WILL get token for user ${userId}`);
    const result = await this.refreshTokenRepository.findMany({ userId });
    this.appLogger.log(`DID get token for user ${userId}`);
    return result;
  }

  async logOut(context: AppContext, { userId, sessionId }: LogOutRequestDto) {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('logOut');
    this.appLogger.log(
      `WILL log out for user ${userId} - session ${sessionId}`,
    );
    const result = await this.refreshTokenRepository.deleteOne({
      userId,
      sessionId,
    });
    this.appLogger.log(
      `DID log out for user ${userId} - session ${sessionId}}`,
    );
    return result;
  }
}
