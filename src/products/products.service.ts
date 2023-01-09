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
        const forwardedCount = await this.productsForward.count({
          where: {
            product,
          },
        });

        const includeInventoryProduct = {
          ...product,
          soldQuantity: forwardedCount,
          remainingQuantity: product.productQuantity - forwardedCount,
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
            forwardHistoryType: 'Forwarding',
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

  async fetchForwardedProducts({
    sellingCountry,
    productId,
    page,
    limit,
  }: FetchForwardedProductsQuery): Promise<FetchForwardedProductsOutput> {
    try {
      let product: Product | undefined;
      if (productId) {
        product = await this.products.findOne({ where: { id: productId } });
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
      }

      const [forwardedProducts, totalForwardedProducts] =
        await this.productsForward.findAndCount({
          relations: ['product', 'productForwardedUser'],
          take: limit,
          skip: (page - 1) * limit,
          order: {
            id: 'DESC',
          },
          where: {
            forwardHistoryType: 'Forwarding',
            ...(sellingCountry && { sellingCountry }),
            ...(product && { product }),
          },
        });

      return {
        ok: true,
        totalPages: Math.ceil(totalForwardedProducts / limit),
        totalResults: totalForwardedProducts,
        forwardedProducts,
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

  async cancelForwardingProduct(
    {
      barcode: barcodeInput,
      sellingCountry: sellingCountryInput,
    }: CancelForwardingProductInput,
    me: User,
  ): Promise<CancelForwardingProductOutput> {
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

      await queryRunner.manager.getRepository(Product).save({
        id: product.id,
        productQuantity: productQuantity + 1,
      });

      const canceledForwardingProductHistory = await queryRunner.manager
        .getRepository(ProductForward)
        .save(
          queryRunner.manager.getRepository(ProductForward).create({
            forwardHistoryType: 'Cancel',
            barcode,
            productName,
            productImage,
            productAmount,
            sellingCurrency,
            sellingCountry,
            remainingQuantity: productQuantity + 1,
            product,
            productForwardedUser: me,
          }),
        );

      await queryRunner.commitTransaction();

      const canceledForwardingCount = await this.productsForward.count({
        where: { barcode: barcodeInput, sellingCountry: sellingCountryInput },
      });

      return {
        ok: true,
        canceledForwardingProduct: canceledForwardingProductHistory,
        canceledForwardingCount,
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

  async fetchCanceledForwardingProducts({
    sellingCountry,
    productId,
    page,
    limit,
  }: FetchCanceledForwardingProductsQuery): Promise<FetchCanceledForwardingProductsOutput> {
    try {
      let product: Product | undefined;
      if (productId) {
        product = await this.products.findOne({ where: { id: productId } });
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
      }

      const [canceledForwardingProducts, totalCanceledForwardingProduct] =
        await this.productsForward.findAndCount({
          relations: ['product', 'productForwardedUser'],
          take: limit,
          skip: (page - 1) * limit,
          order: {
            id: 'DESC',
          },
          where: {
            forwardHistoryType: 'Cancel',
            ...(sellingCountry && { sellingCountry }),
            ...(product && { product }),
          },
        });

      return {
        ok: true,
        totalPages: Math.ceil(totalCanceledForwardingProduct / limit),
        totalResults: totalCanceledForwardingProduct,
        canceledForwardingProducts,
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
