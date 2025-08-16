import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenError } from '@root/interface/error.response';
import { AppContext } from '@shared/decorator/context.decorator';
import { AppLogger } from '@shared/logger';
import { basename } from 'path';
import { status } from '@grpc/grpc-js';
import { GetUserTokenQuery, logOutResponse, RotateTokenResponse } from '@root/interface/auth.proto.interface';
import { UserRepository } from '@repositories/user.repository';
import { RedisService } from '@root/redis/redis.service';
import { BlackListedAccessToken_Prefix } from '@root/redis/constant';

@Injectable()
export class RefreshTokenService {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private appLogger: AppLogger,
    private redis: RedisService,
  ) {}

  async issueTokenPair({ slugId }) {
    const refreshToken = v4();
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const accessToken = this.jwtService.sign({ slugId }, { expiresIn: '5m' });
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
  ): Promise<RotateTokenResponse> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('rotateToken');
    this.appLogger.log(`WILL rotate token for user ${userId}`);

    const record = await this.refreshTokenRepository.findOne({ userId, sessionId });
    if (!record) {
      throw new RefreshTokenError({
        errorCode: status.NOT_FOUND,
        details: 'No token found',
      });
    }

    const validToken = await bcrypt.compare(refreshToken, record.tokenHash);
    if (!validToken) {
      throw new RefreshTokenError({
        errorCode: status.UNAUTHENTICATED,
        details: 'Invalid token',
      });
    }

    const checkUsedTokenResult = await Promise.all(
      record.usedTokenHashes.map((token) => bcrypt.compare(refreshToken, token)),
    );
    if (checkUsedTokenResult.some((item) => item)) {
      await this.refreshTokenRepository.deleteMany({ userId });
      this.appLogger.error(
        `FAILED rotate token for user ${userId}: rotate an used token detected`,
      );
      throw new RefreshTokenError({
        errorCode: status.UNAUTHENTICATED,
        details: 'Invalid credential, please login again',
      });
    }

    const isTokenExpired = record.expiresAt < new Date();
    if (isTokenExpired) {
      await this.refreshTokenRepository.deleteMany({ userId });
      this.appLogger.error(
        `FAILED rotate token for user ${userId}: rotate an expired token`,
      );
      throw new RefreshTokenError({
        errorCode: status.UNAUTHENTICATED,
        details: 'Refresh token expired, please login again',
      });
    }

    const user = await this.userRepository.findOne({ userId });
    if (!user) {
      this.appLogger.error(`FAILED rotate token for user ${userId}: user not found`);
      throw new RefreshTokenError({
        errorCode: status.NOT_FOUND,
        details: 'User not found',
      });
    }
    const { accessToken, refreshTokenInfo } = await this.issueTokenPair({ slugId: user.slugId });
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

  async getTokenForUser(context: AppContext, { slugId }: GetUserTokenQuery) {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('getTokenForUser');
    this.appLogger.log(`WILL get token for user ${slugId}`);
    const result = await this.refreshTokenRepository.findMany({ userId: slugId });
    this.appLogger.log(`DID get token for user ${slugId}`);
    return {
      tokens: result.map((data) => data.userId),
    };
  }

  async logOut(context: AppContext, { userId, sessionId, accessToken }): Promise<logOutResponse> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('logOut');
    this.appLogger.log(
      `WILL log out for user ${userId} - session ${sessionId}`,
    );

    // Decode the access token to get its expiration time
    let tokenExp: number;
    try {
      const decoded = this.jwtService.decode(accessToken) as any;
      tokenExp = decoded.exp;
    } catch (error) {
      this.appLogger.error(`Failed to decode access token: ${error.message}`);
      tokenExp = Math.floor(Date.now() / 1000) + 300; 
    }

    // Calculate TTL for Redis (time until token naturally expires)
    const currentTime = Math.floor(Date.now() / 1000);
    const ttlSeconds = Math.max(0, tokenExp - currentTime);

    // Add access token to blacklist in Redis
    if (ttlSeconds > 0) {
      await this.redis.set(`${BlackListedAccessToken_Prefix}${accessToken}`, true, ttlSeconds);
      this.appLogger.log(`Added access token to blacklist with TTL ${ttlSeconds} seconds`);
    }

    // Delete the refresh token
    await this.refreshTokenRepository.deleteOne({ userId, sessionId });
    
    this.appLogger.log(
      `DID log out for user ${userId} - session ${sessionId}`,
    );
    
    return {
      isSuccess: true,
      message: 'Successfully logged out',
    };
  }
}
