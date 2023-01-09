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
import {
  CancelForwardingProductInput,
  CancelForwardingProductOutput,
} from '@src/products/dtos/cancel-forwarding-product.dto';
import {
  FetchCanceledForwardingProductsQuery,
  FetchCanceledForwardingProductsOutput,
} from '@src/products/dtos/fetch-canceled-forwarding-products.dto';
import {
  DefectiveDamageProductInput,
  DefectiveDamageProductOutput,
} from '@src/products/dtos/defective-damage-product.dto';

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

  @Post('/cancel/forwarding')
  @Role(['Manager', 'RootAdmin'])
  async cancelForwardingProduct(
    @Body(ValidationPipe)
    cancelForwardingProductInput: CancelForwardingProductInput,
    @AuthUser() me: User,
  ): Promise<CancelForwardingProductOutput> {
    return apiResult(
      await this.productsService.cancelForwardingProduct(
        cancelForwardingProductInput,
        me,
      ),
    );
  }

  @Get('/canceled/forwarding')
  @Role(['Any'])
  async fetchCanceledForwardingProducts(
    @Query(ValidationPipe)
    fetchCanceledForwardingProductsQuery: FetchCanceledForwardingProductsQuery,
  ): Promise<FetchCanceledForwardingProductsOutput> {
    return apiResult(
      await this.productsService.fetchCanceledForwardingProducts(
        fetchCanceledForwardingProductsQuery,
      ),
    );
  }

  @Post('/defective-damage')
  @Role(['Manager', 'RootAdmin'])
  async defectiveDamageProduct(
    @Body(ValidationPipe)
    defectiveDamageProductInput: DefectiveDamageProductInput,
    @AuthUser() me: User,
  ): Promise<DefectiveDamageProductOutput> {
    return apiResult(
      await this.productsService.defectiveDamageProduct(
        defectiveDamageProductInput,
        me,
      ),
    );
  }
}
