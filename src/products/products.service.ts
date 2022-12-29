import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@src/users/entities/user.entity';

import { Product } from '@src/products/entities/product.entity';

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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async fetchProductByBarcode({
    barcode,
  }: FetchProductByBarcodeParam): Promise<FetchProductByBarcodeOutput> {
    try {
      const product = await this.products.findOne({
        where: { barcode },
      });

      if (!product) {
        return {
          ok: false,
          error: {
            statusCode: 403,
            statusType: 'FORBIDDEN',
            message: 'product-not-found',
          },
        };
      }

      return {
        ok: true,
        product,
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

  async createProduct(
    {
      barcode,
      productName,
      productImage,
      productAmount,
      sellingCurrency,
      sellingCountry,
      productQuantity,
    }: CreateProductInput,
    me: User,
  ): Promise<CreateProductOutput> {
    try {
      const existProduct = await this.products.findOne({
        where: {
          barcode,
          sellingCountry,
        },
      });
      if (existProduct) {
        return {
          ok: false,
          error: {
            statusCode: 403,
            statusType: 'FORBIDDEN',
            message: 'exist-product',
          },
        };
      }

      const createdProduct = await this.products.save(
        this.products.create({
          barcode,
          productName,
          productImage,
          productAmount,
          sellingCurrency,
          sellingCountry,
          productQuantity,
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

  async fetchProducts({
    sellingCountry,
    page,
    limit,
  }: FetchProductsQuery): Promise<FetchProductsOutput> {
    try {
      const [products, totalProducts] = await this.products.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        order: {
          id: 'DESC',
        },
        ...(sellingCountry && {
          where: {
            sellingCountry,
          },
        }),
      });

      const includeInventoryProducts: FetchProductsOutput['products'] = [];
      for (const product of products) {
        const includeInventoryProduct = {
          ...product,
          soldQuantity: 55345,
          remainingQuantity: 30023,
        };
        includeInventoryProducts.push(includeInventoryProduct);
      }

      return {
        ok: true,
        totalPages: Math.ceil(totalProducts / limit),
        totalResults: totalProducts,
        products: includeInventoryProducts,
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
