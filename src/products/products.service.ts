import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@src/users/entities/user.entity';

import { Product } from '@src/products/entities/product.entity';

import {
  CreateProductInput,
  CreateProductOutput,
} from '@src/products/dtos/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async createProduct(
    {
      barcode,
      productName,
      productImage,
      productAmount,
      sellingCurrency,
      sellingCountry,
    }: CreateProductInput,
    me: User,
  ): Promise<CreateProductOutput> {
    try {
      const createdProduct = await this.products.save(
        this.products.create({
          barcode,
          productName,
          productImage,
          productAmount,
          sellingCurrency,
          sellingCountry,
          createdUser: me,
        }),
      );

      return {
        ok: true,
        product: {
          id: createdProduct.id,
        },
      };
    } catch (err) {
      throw new HttpException(
        {
          ok: false,
          serverError: err,
        },
        500,
      );
    }
  }
}
