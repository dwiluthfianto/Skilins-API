// src/filters/prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class ContentExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'An error occurred!';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Tangani error Prisma secara spesifik berdasarkan kode error
    switch (exception.code) {
      case 'P2025': // Record not found
        message = this.handleRecordNotFound(exception);
        status = HttpStatus.NOT_FOUND;
        break;

      case 'P2002': // Unique constraint error
        message = 'Unique constraint violation occurred.';
        status = HttpStatus.CONFLICT;
        break;

      // Tambahkan kasus lain jika diperlukan
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: this.getErrorMessage(exception),
      timestamp: new Date().toISOString(),
    });
  }

  private handleRecordNotFound(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    return 'Record not found or invalid UUID.';
  }

  private getErrorMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    // Mengembalikan cause jika ada, atau fallback ke message lain
    if (exception.meta && typeof exception.meta.cause === 'string') {
      return exception.meta.cause;
    }
    return exception.message; // Jika cause tidak ada
  }
}
