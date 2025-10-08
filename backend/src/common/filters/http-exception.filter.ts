import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // ✅ Handle known NestJS HttpExceptions cleanly
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();

      // extract readable message from HttpException
      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else if (responseMessage && typeof responseMessage === 'object') {
        message =
          (responseMessage as any).message ||
          (responseMessage as any).error ||
          'Internal server error';
      }
    }

    // ✅ Log it once here globally
    this.logger.error('Exception caught', message, {
      method: request.method,
      url: request.url,
      status,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
