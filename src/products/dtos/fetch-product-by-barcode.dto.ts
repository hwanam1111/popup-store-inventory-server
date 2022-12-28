import { IsOptional, IsString } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { Product } from '@src/products/entities/product.entity';

export class FetchProductByBarcodeParam {
  @IsOptional()
  @IsString()
  barcode?: string;
}

export class FetchProductByBarcodeOutput extends CoreOutput {
  product?: Product;
}
