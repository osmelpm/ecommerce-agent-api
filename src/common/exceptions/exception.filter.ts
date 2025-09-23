import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(GlobalExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    exception.code = exception.code ?? exception.status;

    let status: number;
    let message = exception.message;
    let error =
      exception.response?.data?.errors ??
      exception.response?.errors ??
      exception.error;

    switch (exception.code) {
      case 400:
        status = HttpStatus.BAD_REQUEST;
        error = error ?? 'Bad Request';
        break;
      case 404:
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        error = error ?? 'Not Found';
        break;
      case 401:
        status = HttpStatus.UNAUTHORIZED;
        error = error ?? 'Unauthorized';
        break;
      case 403:
        status = HttpStatus.FORBIDDEN;
        error = error ?? 'Forbidden';
        break;
      case 406:
        // case 11000: // Duplicate key
        //   status = HttpStatus.NOT_ACCEPTABLE;
        //   message =
        //     exception.code === 11000
        //       ? `Duplicate Key: ${extractDuplicateKey(message)}`
        //       : message;

        error = error ?? 'Not Acceptable';
        break;
      case 501:
        status = HttpStatus.NOT_IMPLEMENTED;
        error = error ?? 'Not Implemented';

        break;
      default:
        this.logger.error('UNHANDLED ERROR', exception);

        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = message ?? 'Check Server Logs';
        error = error ?? 'Unprocessable Entity';
    }

    const errorResponse = {
      status,
      error,
      message,
    };

    this.logger.error(errorResponse);

    return host.switchToHttp().getResponse().status(status).json(errorResponse);
  }
}
