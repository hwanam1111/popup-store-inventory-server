import { IsEnum, IsNumber, IsString, Length } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import {
  CountryName,
  countryName,
  CurrencyUnit,
  currencyUnit,
} from '@src/products/products.enum';

export class CreateProductInput {
  @IsString()
  @Length(1, 100)
  barcode: string;

  @IsString()
  @Length(1, 500)
  productName: string;

  @IsString()
  @Length(1, 300)
  productImage: string;

  @IsNumber()
  productAmount: number;

  @IsEnum(currencyUnit)
  sellingCurrency: CurrencyUnit;

  @IsEnum(countryName)
  sellingCountry: CountryName;

  @IsNumber()
  productQuantity: number;
}

export class CreateProductOutput extends CoreOutput {
  product?: {
    id: number;
  };
}
