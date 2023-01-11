import { IsNumber, IsOptional } from 'class-validator';

import {
  PaginationInput,
  PaginationOutput,
} from '@src/common/dtos/pagination.dto';
import { ProductEditHistory } from '@src/products/entities/product-edit-history.entity';

export class FetchEditedProductsHistoryQuery extends PaginationInput {
  @IsNumber()
  @IsOptional()
  productId?: number;
}

export class FetchEditedProductsHistoryOutput extends PaginationOutput {
  editedProductHistory?: ProductEditHistory[];
}
