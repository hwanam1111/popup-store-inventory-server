import { IsNumber } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';

export class EditProductQuantityParam {
  @IsNumber()
  productId: number;
}

export class EditProductQuantityInput {
  @IsNumber()
  productQuantity: number;
}

export class EditProductQuantityOutput extends CoreOutput {
  editedProduct?: {
    id: number;
  };
}
