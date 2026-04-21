import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { ZodError, type ZodTypeAny } from 'zod';

class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const err = result.error as ZodError;
      throw new BadRequestException({
        success: false,
        data: null,
        error: {
          code: 'ZOD_VALIDATION',
          message: 'Request validation failed',
          details: err.issues.map((i) => ({
            path: i.path.join('.'),
            code: i.code,
            message: i.message,
          })),
        },
      });
    }
    return result.data;
  }
}

export function createZodValidationPipe<T extends ZodTypeAny>(schema: T): ZodValidationPipe<T> {
  return new ZodValidationPipe(schema);
}
