import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthGrpcController } from './controller/auth.grpc.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@root/schemas/user.schema';
import { UserRepository } from '@root/repositories/user.repository';
import { AppLogger } from '@shared/logger';
import { RefreshTokenService } from './service/refresh-token.service';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';
import { RefreshToken, RefreshTokenSchema } from '@schemas/refreshToken.schema';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@app/config/config.module';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
    ]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get('jwt');
        return {
          secret: jwt.jwtSecret,
          signOptions: {
            expiresIn: jwt.expiresIn,
          },
        };
      },
    }),
    ClientsModule.register([
      {
        name: 'CHARACTER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'character',
          protoPath: 'src/proto/character.proto',
          url: '0.0.0.0:4003',
        },
      },
    ]),
    CacheModule.register({
      store: redisStore as any,
      host: 'localhost',
      port: 6379,
      ttl: 60,
    }),
  ],
  controllers: [AuthGrpcController],
  providers: [
    AuthService,
    UserRepository,
    RefreshTokenService,
    RefreshTokenRepository,
    AppLogger,
  ],
})
export class AuthModule {}
