import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AppContext {
  traceId: string;
  token: string;
}

export const Context = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AppContext => {
    const request = ctx.switchToHttp().getRequest();

    const token = request.get('Authorization');
    const traceId = request.get('x-request-id');

    return {
      traceId,
      token,
    };
  },
);
