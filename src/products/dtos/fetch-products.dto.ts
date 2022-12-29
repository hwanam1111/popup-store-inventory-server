import { IsEnum, IsOptional } from 'class-validator';

import {
  PaginationInput,
  PaginationOutput,
} from '@src/common/dtos/pagination.dto';
import {
  CountryName,
  countryName,
  Product,
} from '@src/products/entities/product.entity';

export class FetchProductsQuery extends PaginationInput {
  @IsOptional()
  @IsEnum(countryName)
  sellingCountry?: CountryName;
}

class InventoryOutput {
  remainingQuantity: number;
  soldQuantity: number;
}

export class FetchProductsOutput extends PaginationOutput {
  products?: (Product | InventoryOutput)[];
}
