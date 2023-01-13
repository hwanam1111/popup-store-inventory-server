import { IsEnum, IsOptional } from 'class-validator';

import {
  PaginationInput,
  PaginationOutput,
} from '@src/common/dtos/pagination.dto';
import { Product } from '@src/products/entities/product.entity';

import { CountryName, countryName } from '@src/products/products.enum';

export class FetchProductsQuery extends PaginationInput {
  @IsOptional()
  @IsEnum(countryName)
  sellingCountry?: CountryName;
}

export class FetchProductsOutput extends PaginationOutput {
  products?: (
    | Product
    | {
        canceledCount: number;
        soldQuantity: number;
        defectiveQuantity: number;
        damageQuantity: number;
      }
  )[];
}
