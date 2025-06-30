import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from '@shared/logger';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLogger);

  // RBAC microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'rbac',
      protoPath: join(__dirname, '../features/rbac/proto/rbac.proto'),
      url: '0.0.0.0:4002',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../features/auth/proto/auth.proto'),
      url: '0.0.0.0:4001',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });
  await app.startAllMicroservices();

  logger.log(`RBAC gRPC microservice is running on port: 4002`);
  logger.log(`Auth gRPC microservice is running on port: 4001`);
}
bootstrap();
