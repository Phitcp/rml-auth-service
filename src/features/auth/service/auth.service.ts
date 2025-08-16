import {
  GetUserFromSlugRequest,
  GetUserFromSlugResponse,
  VerifyRegisterOtpRequest,
  VerifyRegisterOtpResponse,
} from './../../../interface/auth.proto.interface';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@root/repositories/user.repository';
import {
  AuthenticationFailed,
  LoginFailedError,
  RegisterFailedError,
} from '../../../interface/error.response';
import { v4 } from 'uuid';
import { AppContext } from '@shared/decorator/context.decorator';
import { AppLogger } from '@root/shared-libs/logger';
import { basename } from 'path';
import bcrypt from 'bcrypt';
import _ from 'lodash';

import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';
import { Metadata, status } from '@grpc/grpc-js';
import {
  LoginRequest,
  LoginResponse,
  RegisterOtpRequest,
  RegisterOtpResponse,
} from '@root/interface/auth.proto.interface';
import { CharacterServiceClient } from '@interface/character.proto.interface';
import { GrpcClient } from '@shared/utilities/grpc-client';
import { firstValueFrom } from 'rxjs';
import { mailTransporter } from '@shared/utilities';
import { APP_ROLE } from '@shared/constant/common';
import { customAlphabet } from 'nanoid';
import { COUNTRY_CODE } from '@shared/constant/common';
import { RedisService } from '@root/redis/redis.service';
import { OtpToken_PreFix } from '../../../redis/constant';

@Injectable()
export class AuthService {
  private characterService: CharacterServiceClient;
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private refreshTokenService: RefreshTokenService,
    private appLogger: AppLogger,
    private redis: RedisService,
  ) {
    const grpcClient = new GrpcClient<CharacterServiceClient>({
      package: 'character',
      protoPath: 'src/proto/character.proto',
      url: '0.0.0.0:4003',
      serviceName: 'CharacterService',
    });
    this.characterService = grpcClient.getService();
  }

  private slugIdGenerator(countryCode?: COUNTRY_CODE): string {
    const code = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)();
    if (!countryCode) {
      return code; // If no country code is provided, return just the code
    }
    return `${countryCode}_${code}`;
  }

  private async createNewUser({
    context,
    password,
    username,
    email,
  }: {
    context: AppContext;
    password: string;
    username: string;
    email: string;
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const slugId = this.slugIdGenerator(); // Default to VN, can be changed based on requirements
    const userObject = {
      email,
      username,
      password: hashedPassword,
      userId: v4(),
      slugId,
    };

    const newUser = await this.userRepository.createOne(userObject);
    this.appLogger.log('Did registerUser success');
    const metaData = new Metadata();
    metaData.add('x-trace-id', context.traceId);

    this.appLogger.log('Will create app character for new user');
    await firstValueFrom(
      this.characterService.createCharacterProfile(
        {
          userId: newUser.userId,
          userName: newUser.username,
        },
        metaData,
      ),
    );
    this.appLogger.log('Did create app character for new user');
    return _.pick(newUser, ['username', 'email', 'slugId', 'userId']);
  }

  async login(context: AppContext, data: LoginRequest): Promise<LoginResponse> {
    const { email, password } = data;
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('login');

    this.appLogger.log('Will login');
    const foundUser = await this.userRepository.findOne({ email });

    if (!foundUser) {
      this.appLogger.log('Failed login: Not found user');
      throw new LoginFailedError({
        errorCode: status.UNAUTHENTICATED,
        details: 'Wrong credential',
      });
    }

    const isMatchPassword = await bcrypt.compare(password, foundUser.password);

    if (!isMatchPassword) {
      this.appLogger.log('Failed login: Not match password');
      throw new LoginFailedError({
        errorCode: status.UNAUTHENTICATED,
        details: 'Wrong credential',
      });
    }

    const { accessToken, refreshTokenInfo } =
      await this.refreshTokenService.issueTokenPair({
        slugId: foundUser.slugId,
      });

    const newRefreshToken = await this.refreshTokenRepository.createOne({
      userId: foundUser.userId,
      tokenHash: refreshTokenInfo.tokenHash,
      expiresAt: refreshTokenInfo.expiresAt,
      usedTokenHashes: [],
    });

    return {
      slugId: foundUser.slugId,
      username: foundUser.username,
      email: foundUser.email,
      accessToken,
      refreshToken: refreshTokenInfo.refreshToken,
      sessionId: newRefreshToken.sessionId,
      role: foundUser.role,
    };
  }

  async registerOtp(
    context: AppContext,
    data: RegisterOtpRequest,
  ): Promise<RegisterOtpResponse> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('registerOtp');
    this.appLogger.log('Will registerOtp');
    const metadata = new Metadata();
    metadata.add('x-trace-id', context.traceId);
    const foundUser = await this.userRepository.findOne({
      email: data.email,
    });

    if (foundUser) {
      this.appLogger.error('Failed registerOtp: Existed email');
      throw new RegisterFailedError({
        errorCode: status.ALREADY_EXISTS,
        details: 'Email already register',
      });
    }

    const otp = Math.floor(Math.random() * 1_000_000);

    const otpToken = `${OtpToken_PreFix}${data.email}`;

    this.appLogger.log(`Will send otp ${otp} to email: ${data.email}`);

    // await mailTransporter().sendMail({
    //   from: 'no-reply@example.com',
    //   to: data.email,
    //   subject: 'Your OTP Code',
    //   html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    // });

    this.appLogger.log('Did send otp to email');

    this.appLogger.log(
      `Will set otp token: ${otpToken} with value: ${otp} to cache`,
    );
    await this.redis.set(otpToken, otp, 60 * 5 * 1000); // 5 minutes expiration
    this.appLogger.log(
      `Did set otp token: ${otpToken} with value: ${otp} to cache`,
    );
    this.appLogger.log('Did registerOtp');
    return {
      email: data.email,
      otp,
    };
  }

  async verifyRegisterOtp(
    context: AppContext,
    data: VerifyRegisterOtpRequest,
  ): Promise<VerifyRegisterOtpResponse> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('verifyOtp');
    this.appLogger.log('Will verifyOtp');
    const otpToken = `${OtpToken_PreFix}${data.email}`;
    const cachedOtp = await this.redis.get(otpToken);
    this.appLogger.log(`Will get and verify otp token: ${otpToken} from cache`);
    if (!cachedOtp) {
      this.appLogger.error('Failed verifyOtp: OTP expired or not found');
      throw new RegisterFailedError({
        errorCode: status.NOT_FOUND,
        details: 'OTP expired or not found',
      });
    }

    if (cachedOtp !== data.otp) {
      this.appLogger.error('Failed verifyOtp: OTP does not match');
      throw new RegisterFailedError({
        errorCode: status.INVALID_ARGUMENT,
        details: 'OTP does not match',
      });
    }

    this.appLogger.log('Did verifyOtp successfully');
    await this.redis.client.del(otpToken); // Clear the OTP after successful verification
    this.appLogger.log(`Did delete otp token: ${otpToken} from cache`);

    // Create new user with default username and password
    const defaultUserNameAndPassword = data.email.split('@')[0];
    this.appLogger.log(
      `Will create new user with email: ${data.email} and username: ${defaultUserNameAndPassword}`,
    );
    const { email, username, slugId, userId } = await this.createNewUser({
      context,
      email: data.email,
      username: defaultUserNameAndPassword,
      password: defaultUserNameAndPassword,
    });
    this.appLogger.log(
      `Did create new user with email: ${email} and username: ${username}`,
    );
    this.appLogger.log('Did verifyRegisterOtp successfully');

    const metadata = new Metadata();
    metadata.add('x-trace-id', context.traceId);

    // create character profile for the new user
    this.appLogger.log('Will create character profile for the new user');
    this.appLogger.log('Did create character profile for the new user');

    // login the user automatically
    this.appLogger.log('Will login the user automatically');
    const { accessToken, refreshTokenInfo } =
      await this.refreshTokenService.issueTokenPair({
        slugId,
      });
    const newRefreshToken = await this.refreshTokenRepository.createOne({
      userId,
      tokenHash: refreshTokenInfo.tokenHash,
      expiresAt: refreshTokenInfo.expiresAt,
      usedTokenHashes: [],
    });

    this.appLogger.log('Did login the user automatically');
    return {
      slugId,
      username,
      email,
      accessToken,
      refreshToken: refreshTokenInfo.refreshToken,
      sessionId: newRefreshToken.sessionId,
      role: APP_ROLE.USER, // Assuming default role is USER
    };
  }

  async getUserFromSlug(
    context: AppContext,
    data: GetUserFromSlugRequest,
  ): Promise<GetUserFromSlugResponse> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('getUserFromSlug');
    this.appLogger.log('Will getUserFromSlug');
    if (!data.slugId) {
      this.appLogger.error(`No user found for slug ${data.slugId}`);
      throw new AuthenticationFailed({
        errorCode: status.NOT_FOUND,
        details: 'Not found user',
      });
    }
    const user = await this.userRepository.findOne({ slugId: data.slugId });
    if (!user) {
      this.appLogger.error(`No user found for slug ${data.slugId}`);
      throw new AuthenticationFailed({
        errorCode: status.NOT_FOUND,
        details: 'Not found user',
      });
    }
    this.appLogger.log('DID found user')
    return user;
  }
}
