import { IsEnum, IsString, Length } from 'class-validator';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import { CountryName, countryName } from '@src/products/products.enum';

import { CoreOutput } from '@src/common/dtos/output.dto';

export class CancelForwardingProductInput {
  @IsString()
  @Length(1, 100)
  barcode: string;

  @IsEnum(countryName)
  sellingCountry: CountryName;
}

export class CancelForwardingProductOutput extends CoreOutput {
  canceledForwardingProduct?: ProductForward;
  canceledForwardingCount?: number;
}
