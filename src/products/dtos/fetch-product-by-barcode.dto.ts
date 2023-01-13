import { IsString, IsEnum, IsOptional } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { Product } from '@src/products/entities/product.entity';
import { CountryName, countryName } from '@src/products/products.enum';

export class FetchProductByBarcodeQuery {
  @IsEnum(countryName)
  @IsOptional()
  sellingCountry?: CountryName;
}

export class FetchProductByBarcodeParam {
  @IsString()
  barcode: string;
}

export class FetchProductByBarcodeOutput extends CoreOutput {
  product?: Product;
}
