import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';

import { apiResult } from '@src/api-result';

import { Role } from '@src/auth/role.decorator';
import { AuthUser } from '@src/auth/auth-user.decorator';
import { User } from '@src/users/entities/user.entity';

import { ProductsService } from '@src/products/products.service';

import {
  CreateProductInput,
  CreateProductOutput,
} from '@src/products/dtos/create-product.dto';

@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('/')
  @Role(['Any'])
  async createProduct(
    @Body(ValidationPipe) createProductInput: CreateProductInput,
    @AuthUser() me: User,
  ): Promise<CreateProductOutput> {
    return apiResult(
      await this.productsService.createProduct(createProductInput, me),
    );
  }
}
