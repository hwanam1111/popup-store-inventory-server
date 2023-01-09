import { IsEnum, IsString, Length } from 'class-validator';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import {
  CountryName,
  countryName,
  ForwardHistoryType,
  forwardHistoryType,
} from '@src/products/products.enum';

import { CoreOutput } from '@src/common/dtos/output.dto';

export class DefectiveDamageProductInput {
  @IsString()
  @Length(1, 100)
  barcode: string;

  @IsEnum(countryName)
  sellingCountry: CountryName;

  @IsEnum(forwardHistoryType)
  forwardHistoryType: ForwardHistoryType;

  @IsString()
  @Length(1, 10000)
  memo: string;
}

export class DefectiveDamageProductOutput extends CoreOutput {
  defectiveDamageProduct?: ProductForward;
  defectiveDamageCount?: number;
}
