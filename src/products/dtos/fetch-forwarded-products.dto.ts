import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import { CountryName, countryName } from '@src/products/products.enum';

import {
  PaginationInput,
  PaginationOutput,
} from '@src/common/dtos/pagination.dto';

export class FetchForwardedProductsQuery extends PaginationInput {
  @IsEnum(countryName)
  @IsOptional()
  sellingCountry?: CountryName;

  @IsNumber()
  @IsOptional()
  productId?: number;

  @IsOptional()
  @IsString()
  isOnlyMeData: string;
}

export class FetchForwardedProductsOutput extends PaginationOutput {
  forwardedProducts?: ProductForward[];
}
