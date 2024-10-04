import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'An error occurred!';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025': // Record not found
          message = 'Record not found or invalid UUID.';
          status = HttpStatus.NOT_FOUND;
          break;

        case 'P2002': // Unique constraint error
          message = 'Unique constraint violation occurred.';
          status = HttpStatus.CONFLICT;
          break;

        case 'P2003': // Foreign key constraint failed
          message =
            'Foreign key constraint failed. Please check your references.';
          status = HttpStatus.BAD_REQUEST;
          break;

        case 'P2004': // Transaction failed
          message = 'Transaction failed. Please try again.';
          status = HttpStatus.BAD_REQUEST;
          break;

        case 'P2005': // Invalid input
          message = 'Invalid input provided. Please check your data.';
          status = HttpStatus.BAD_REQUEST;
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      message = 'Validation error occurred. Please check the provided data.';
      status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: this.getErrorMessage(exception),
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorMessage(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
  ): string {
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.meta &&
      typeof exception.meta.cause === 'string'
    ) {
      return exception.meta.cause;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      const errorLines = exception.message.split('\n');
      const relevantDetails = errorLines
        .filter((line) => line.includes('Argument') || line.includes('Invalid'))
        .map((line) => line.trim())
        .join(' | ');

      return `Validation failed: ${relevantDetails || 'No specific details available.'}`;
    }
    return exception.message;
  }
}
