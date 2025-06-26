import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import pkg from '../package.json';
import { AppLogger } from '@shared/logger';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
const swaggerAlias = 'explorer';
async function bootstrap() {
  const appPort = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLogger);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle(pkg.name)
    .setDescription(pkg.description)
    .setVersion(pkg.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerAlias, app, document);

  const microservice = app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'rbac',
      protoPath: join(__dirname, '../features/rbac/proto/rbac.proto'),
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
  await app.listen(appPort);
  logger
    .addLogContext('App Start Successfully')
    .log(`${pkg.name} is now running on port: ${appPort}`);
  logger.log(
    `Swagger available at http://localhost:${appPort}/${swaggerAlias}`,
  );
  logger.log(`gRPC microservice is running on port: 4001`);
}
bootstrap();
