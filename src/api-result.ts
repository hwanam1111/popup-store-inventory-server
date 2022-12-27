import { HttpException } from '@nestjs/common';
import { CoreOutput } from '@src/common/dtos/output.dto';

export function apiResult(result: CoreOutput) {
  const { ok, error } = result;

  if (!ok && error) {
    throw new HttpException(
      {
        ok: false,
        error: error,
      },
      error.statusCode,
    );
  }

  return result;
}
