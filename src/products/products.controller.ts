import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import {
  FetchProductsOutput,
  FetchProductsQuery,
} from '@src/products/dtos/fetch-products.dto';
import {
  ForwardingProductInput,
  ForwardingProductOutput,
} from '@src/products/dtos/forwarding-product.dto';
import {
  FetchForwardedProductsQuery,
  FetchForwardedProductsOutput,
} from '@src/products/dtos/fetch-forwarded-products.dto';

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

  @Get('/')
  @Role(['Any'])
  async fetchProducts(
    @Query(ValidationPipe)
    fetchProductQuery: FetchProductsQuery,
  ): Promise<FetchProductsOutput> {
    return apiResult(
      await this.productsService.fetchProducts(fetchProductQuery),
    );
  }

  @Post('/forwarding')
  @Role(['Manager', 'RootAdmin'])
  async forwardingProduct(
    @Body(ValidationPipe)
    forwardingProductInput: ForwardingProductInput,
    @AuthUser() me: User,
  ): Promise<ForwardingProductOutput> {
    return apiResult(
      await this.productsService.forwardingProduct(forwardingProductInput, me),
    );
  }

  @Get('/forwarded')
  @Role(['Any'])
  async fetchForwardedProducts(
    @Query(ValidationPipe)
    fetchForwardedProductsQuery: FetchForwardedProductsQuery,
  ): Promise<FetchForwardedProductsOutput> {
    return apiResult(
      await this.productsService.fetchForwardedProducts(
        fetchForwardedProductsQuery,
      ),
    );
  }
}
