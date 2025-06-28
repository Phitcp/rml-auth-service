import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { AppLogger } from './shared-libs/logger';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RBACModule } from './features/rbac/rbac.module';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';

@Module({
  imports: [
    RBACModule,
    AppConfigModule,
    AuthModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        const dbName = configService.get<string>('database.dbName');
        return {
          uri,
          dbName,
          connectionFactory: (connection) => {
            const logger = new AppLogger();
            logger
              .addLogContext('App Init')
              .log(`Connect to ${dbName} mongodb successfully`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return connection;
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    ConfigService,
    // {
    //   provide: APP_FILTER,
    //   useClass: GRPCExceptionFilter
    // },
    GrpcLogInterceptor,
  ],
  exports: [AppLogger],
})
export class AppModule {}
