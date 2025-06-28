import { Metadata } from '@grpc/grpc-js';
import { createParamDecorator } from '@nestjs/common';

export interface UserContext {
  userId: string;
}

export interface AppContext {
  traceId: string;
  user?: UserContext;
}

export const getContext = (metadata: Metadata): AppContext => {
  const data = metadata.getMap();

  return {
    traceId: String(data['x-trace-id']),
    user: data['user'] ? JSON.parse(String(data['user'])) : {},
  };
};
