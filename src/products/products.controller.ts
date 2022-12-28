import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';

import { apiResult } from '@src/api-result';

import { Role } from '@src/auth/role.decorator';
import { AuthUser } from '@src/auth/auth-user.decorator';
import { User } from '@src/users/entities/user.entity';

import { ProductsService } from '@src/products/products.service';

import {
  CreateProductInput,
  CreateProductOutput,
} from '@src/products/dtos/create-product.dto';
import {
  FetchProductByBarcodeParam,
  FetchProductByBarcodeOutput,
} from '@src/products/dtos/fetch-product-by-barcode.dto';

@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/barcode/:barcode')
  @Role(['Any'])
  async fetchProductByBarcode(
    @Param(ValidationPipe)
    fetchProductByBarcodeParam: FetchProductByBarcodeParam,
  ): Promise<FetchProductByBarcodeOutput> {
    return apiResult(
      await this.productsService.fetchProductByBarcode(
        fetchProductByBarcodeParam,
      ),
    );
  }

  @Post('/')
  @Role(['Manager', 'RootAdmin'])
  async createProduct(
    @Body(ValidationPipe) createProductInput: CreateProductInput,
    @AuthUser() me: User,
  ): Promise<CreateProductOutput> {
    return apiResult(
      await this.productsService.createProduct(createProductInput, me),
    );
  }
}