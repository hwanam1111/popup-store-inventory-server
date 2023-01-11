import { IsNumber } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';

export class DeleteProductParam {
  @IsNumber()
  productId: number;
}

export class DeleteProductOutput extends CoreOutput {
  deletedProduct?: {
    id: number;
  };
}
