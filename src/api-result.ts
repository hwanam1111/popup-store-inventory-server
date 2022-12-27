import { HttpException } from '@nestjs/common';
import { CoreOutput } from '@src/common/dtos/output.dto';

export function apiResult(result: CoreOutput) {
  const { ok, error, httpErrorCode } = result;

  if (!ok && error) {
    throw new HttpException(
      {
        ok: false,
        error: error,
      },
      httpErrorCode || 400,
    );
  }

  return result;
}
