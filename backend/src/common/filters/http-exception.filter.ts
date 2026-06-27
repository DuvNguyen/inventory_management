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
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'object' && responseBody !== null
          ? (responseBody as Record<string, unknown>).message || responseBody
          : responseBody;
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      exception.code === 11000
    ) {
      status = HttpStatus.CONFLICT;
      const keyValue =
        (exception as { keyValue?: Record<string, unknown> }).keyValue || {};
      const key = Object.keys(keyValue)[0] || 'field';
      message = `Duplicate field value entered: ${key}. It must be unique.`;
    } else if (
      exception &&
      typeof exception === 'object' &&
      'name' in exception &&
      exception.name === 'ValidationError'
    ) {
      status = HttpStatus.BAD_REQUEST;
      const errors =
        (exception as { errors?: Record<string, { message: string }> })
          .errors || {};
      message = Object.values(errors).map((val) => val.message);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
