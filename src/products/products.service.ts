import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';

import { User } from '@src/users/entities/user.entity';

import { Product } from '@src/products/entities/product.entity';
import { ProductForward } from '@src/products/entities/product-forward-history.entity';

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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductForward)
    private readonly productsForward: Repository<ProductForward>,
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

  async forwardingProduct(
    {
      barcode: barcodeInput,
      sellingCountry: sellingCountryInput,
    }: ForwardingProductInput,
    me: User,
  ): Promise<ForwardingProductOutput> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.products.findOne({
        where: { barcode: barcodeInput, sellingCountry: sellingCountryInput },
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

      const {
        barcode,
        productName,
        productImage,
        productAmount,
        sellingCurrency,
        sellingCountry,
        productQuantity,
      } = product;

      if (productQuantity <= 0) {
        return {
          ok: false,
          error: {
            statusCode: 403,
            statusType: 'FORBIDDEN',
            message: 'out-of-inventory',
          },
        };
      }

      await queryRunner.manager.getRepository(Product).save({
        id: product.id,
        productQuantity: productQuantity - 1,
      });

      const forwardedProductHistory = await queryRunner.manager
        .getRepository(ProductForward)
        .save(
          queryRunner.manager.getRepository(ProductForward).create({
            barcode,
            productName,
            productImage,
            productAmount,
            sellingCurrency,
            sellingCountry,
            remainingQuantity: productQuantity - 1,
            product,
            productForwardedUser: me,
          }),
        );

      await queryRunner.commitTransaction();

      const forwardedCount = await this.productsForward.count({
        where: { barcode: barcodeInput, sellingCountry: sellingCountryInput },
      });

      return {
        ok: true,
        forwardedProduct: forwardedProductHistory,
        forwardedCount,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new HttpException(
        {
          ok: false,
          serverError: err,
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
