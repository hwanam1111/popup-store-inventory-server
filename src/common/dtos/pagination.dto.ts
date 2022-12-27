import { IsNumber } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';

export class PaginationInput {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}

export class PaginationOutput extends CoreOutput {
  totalPages?: number;
  totalResults?: number;
}
