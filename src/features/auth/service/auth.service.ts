import { Injectable } from '@nestjs/common';
import { UserRepository } from '@root/repositories/user.repository';
import { LoginRequestDto, RegisterRequestDto } from '../dto/request.dto';
import { LoginResponseDto, RegisterResponseDto } from '@auth/dto/response.dto';
import {
  LoginFailedError,
  RegisterFailedError,
} from '../interface/error.response';
import { v4 } from 'uuid';
import { AppContext } from '@shared/decorator/context.decorator';
import { AppLogger } from '@root/shared-libs/logger';
import { basename } from 'path';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private refreshTokenService: RefreshTokenService,
    private appLogger: AppLogger,
  ) {}
  async registerUser(
    context: AppContext,
    { email, username, password }: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('registerUser');

    this.appLogger.log('Will registerUser');
    const usedEmail = await this.userRepository.findOne({
      email,
    });

    if (usedEmail) {
      this.appLogger.error('Failed register: Existed email');
      throw new RegisterFailedError('Email already register');
    }

    const usedUserName = await this.userRepository.findOne({
      username,
    });

    if (usedUserName) {
      this.appLogger.error('Failed register: Existed username');
      throw new RegisterFailedError('Email already register');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userObject = {
      email,
      username,
      password: hashedPassword,
      userId: v4(),
    };

    const newUser = await this.userRepository.createOne(userObject);
    this.appLogger.log('Did registerUser success');
    return _.pick(newUser, ['username', 'email']);
  }

  async login(
    context: AppContext,
    { username, password }: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('login');

    this.appLogger.log('Will login');
    const foundUser = await this.userRepository.findOne({ username });

    if (!foundUser) {
      this.appLogger.log('Failed login: Not found user');
      throw new LoginFailedError('Wrong credential');
    }

    const isMatchPassword = await bcrypt.compare(password, foundUser.password);

    if (!isMatchPassword) {
      this.appLogger.log('Failed login: Not match password');
      throw new LoginFailedError('Wrong credential');
    }

    const { accessToken, refreshTokenInfo } =
      await this.refreshTokenService.issueTokenPair({
        userId: foundUser.userId,
      });
    const newRefreshToken = await this.refreshTokenRepository.createOne({
      userId: foundUser.userId,
      tokenHash: refreshTokenInfo.tokenHash,
      expiresAt: refreshTokenInfo.expiresAt,
      usedTokenHashes: [],
    });

    return {
      userId: foundUser.userId,
      username: foundUser.username,
      email: foundUser.email,
      accessToken,
      refreshToken: refreshTokenInfo.refreshToken,
      sessionId: newRefreshToken.sessionId,
      role: foundUser.role,
    };
  }
}
