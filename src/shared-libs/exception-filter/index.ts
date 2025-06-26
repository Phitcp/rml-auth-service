import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppLogger } from '@shared/logger';
import { Request, Response } from 'express';

@Injectable()
export class ExceptionHandler implements ExceptionFilter {
  constructor(private logger: AppLogger) {}

  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const req = context.getRequest<Request>();
    const res = context.getResponse<Response>();

    const requestId = req.get('x-request-id') || '';
    this.logger.addLogContext(requestId).addMsgParam('App Error');
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Unhandled Error';

    const errorObject = {
      method: req.method,
      path: req.url,
      status,
      message,
    };

    res.status(status).json({
      timestamp: new Date().toISOString(),
      status: errorObject.status,
      message: errorObject.message,
    });
    if (!(exception instanceof HttpException)) {
      this.logger.error(JSON.stringify(errorObject));
    }
  }
}
