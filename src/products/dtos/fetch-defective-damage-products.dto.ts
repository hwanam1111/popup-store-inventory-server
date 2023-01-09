import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import { CountryName, countryName } from '@src/products/products.enum';

import {
  PaginationInput,
  PaginationOutput,
} from '@src/common/dtos/pagination.dto';

export class FetchDefectiveDamageProductsQuery extends PaginationInput {
  @IsEnum(countryName)
  @IsOptional()
  sellingCountry?: CountryName;

  @IsNumber()
  @IsOptional()
  productId?: number;
}

export class FetchDefectiveDamageProductsOutput extends PaginationOutput {
  defectiveDamageProducts?: ProductForward[];
}
