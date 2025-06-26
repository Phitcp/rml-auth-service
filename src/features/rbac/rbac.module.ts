// app.module.ts (API Gateway)
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RBACController } from './controller/rbac.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RBAC_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'rbac',
          protoPath: 'dist/features/rbac/proto/rbac.proto',
          url: '0.0.0.0:4001',
        },
      },
    ]),
  ],
  controllers: [
    RBACController
  ]
})
export class RBACModule {}
