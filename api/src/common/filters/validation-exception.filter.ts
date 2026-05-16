import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

import type { ValidationErrorResponse } from './../types/validation-error-response.type';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse =
      exception.getResponse() as ValidationErrorResponse;

    // Check if the response is from class-validator
    const rawMessages: string[] = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message
      : [exceptionResponse.message];

    // Group by field name (works because class-validator prefixes with property name)
    const errors: Record<string, string[]> = {};
    for (const msg of rawMessages) {
      if (typeof msg !== 'string') continue;
      const field = msg.split(' ')[0]; // "name should not be empty" → "name"
      if (!errors[field]) errors[field] = [];
      errors[field].push(msg);
    }

    response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      errors, // { name: [...], email: [...], password: [...] }
    });
  }
}
