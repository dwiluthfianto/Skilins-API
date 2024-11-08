import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Format pesan error lebih rapi
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
      details:
        exception instanceof HttpException
          ? (exception.getResponse() as any).message
          : exception,
    };

    response.status(status).json(errorResponse);
  }
}
