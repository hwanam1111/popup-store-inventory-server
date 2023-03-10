import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getRepository, Repository } from 'typeorm';

import { User } from '@src/users/entities/user.entity';

import { Product } from '@src/products/entities/product.entity';
import { ProductForward } from '@src/products/entities/product-forward-history.entity';
import { ProductEditHistory } from '@src/products/entities/product-edit-history.entity';
import { ProductDeleteHistory } from '@src/products/entities/product-delete-history.entity';

import {
  CreateProductInput,
  CreateProductOutput,
} from '@src/products/dtos/create-product.dto';
import {
  FetchProductByBarcodeQuery,
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
import {
  FetchDefectiveDamageProductsQuery,
  FetchDefectiveDamageProductsOutput,
} from '@src/products/dtos/fetch-defective-damage-products.dto';
import {
  EditProductQuantityParam,
  EditProductQuantityInput,
  EditProductQuantityOutput,
} from '@src/products/dtos/edit-product-quantity.dto';
import {
  FetchEditedProductsHistoryQuery,
  FetchEditedProductsHistoryOutput,
} from '@src/products/dtos/fetch-edited-products-history.dto';
import {
  DeleteProductParam,
  DeleteProductOutput,
} from '@src/products/dtos/delete-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ProductForward)
    private readonly productsForward: Repository<ProductForward>,
    @InjectRepository(ProductEditHistory)
    private readonly productsEditHistory: Repository<ProductEditHistory>,
  ) {}

  async fetchProductByBarcode(
    { barcode }: FetchProductByBarcodeParam,
    { sellingCountry }: FetchProductByBarcodeQuery,
  ): Promise<FetchProductByBarcodeOutput> {
    try {
      const product = await this.products.findOne({
        where: {
          barcode,
          ...(sellingCountry && { sellingCountry }),
        },
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
            forwardHistoryType: 'Forwarding',
          },
        });

        const canceledCount = await this.productsForward.count({
          where: {
            product,
            forwardHistoryType: 'Cancel',
          },
        });

        const defectiveCount = await this.productsForward.count({
          where: {
            product,
            forwardHistoryType: 'Defective',
          },
        });

        const damageCount = await this.productsForward.count({
          where: {
            product,
            forwardHistoryType: 'Damage',
          },
        });

        const includeInventoryProduct = {
          ...product,
          soldQuantity: forwardedCount - canceledCount,
          canceledQuantity: canceledCount,
          defectiveQuantity: defectiveCount,
          damageQuantity: damageCount,
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

      const canceledCount = await this.productsForward.count({
        where: {
          product,
          forwardHistoryType: 'Cancel',
        },
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
        where: {
          barcode: barcodeInput,
          sellingCountry: sellingCountryInput,
          forwardHistoryType: 'Forwarding',
        },
      });

      return {
        ok: true,
        forwardedProduct: forwardedProductHistory,
        forwardedCount: forwardedCount - canceledCount,
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

  async fetchForwardedProducts(
    me: User,
    {
      sellingCountry,
      productId,
      isOnlyMeData,
      page,
      limit,
    }: FetchForwardedProductsQuery,
  ): Promise<FetchForwardedProductsOutput> {
    console.log('!!!!!', isOnlyMeData);
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

      const [forwardedProducts, totalForwardedProducts] = await getRepository(
        ProductForward,
      )
        .createQueryBuilder('f')
        .select()
        .leftJoinAndSelect('f.product', 'p')
        .leftJoinAndSelect('f.productForwardedUser', 'u')
        .where(
          sellingCountry ? `f.sellingCountry = '${sellingCountry}'` : '1 = 1',
        )
        .andWhere(product ? `productId = ${product.id}` : '1 = 1')
        .andWhere(
          '(forwardHistoryType = "Forwarding" OR forwardHistoryType = "Cancel")',
        )
        .andWhere(isOnlyMeData === 'true' ? `u.id = ${me.id}` : `1 = 1`)
        .take(limit)
        .skip((page - 1) * limit)
        .orderBy('f.id', 'DESC')
        .getManyAndCount();

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
        where: {
          barcode: barcodeInput,
          sellingCountry: sellingCountryInput,
          forwardHistoryType: 'Cancel',
        },
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

  async defectiveDamageProduct(
    {
      barcode: barcodeInput,
      sellingCountry: sellingCountryInput,
      forwardHistoryType,
      memo,
    }: DefectiveDamageProductInput,
    me: User,
  ): Promise<DefectiveDamageProductOutput> {
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

      const defectiveDamageProductHistory = await queryRunner.manager
        .getRepository(ProductForward)
        .save(
          queryRunner.manager.getRepository(ProductForward).create({
            forwardHistoryType: forwardHistoryType,
            barcode,
            productName,
            productImage,
            productAmount,
            sellingCurrency,
            sellingCountry,
            remainingQuantity: productQuantity,
            memo,
            product,
            productForwardedUser: me,
          }),
        );

      await queryRunner.commitTransaction();

      const defectiveDamageCount = await getRepository(ProductForward)
        .createQueryBuilder('f')
        .select()
        .where(
          sellingCountry ? `f.sellingCountry = '${sellingCountry}'` : '1 = 1',
        )
        .andWhere(product ? `productId = ${product.id}` : '1 = 1')
        .andWhere(
          '(forwardHistoryType = "defective" OR forwardHistoryType = "damage")',
        )
        .getCount();

      return {
        ok: true,
        defectiveDamageProduct: defectiveDamageProductHistory,
        defectiveDamageCount,
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

  async fetchDefectiveDamageProducts({
    sellingCountry,
    productId,
    page,
    limit,
  }: FetchDefectiveDamageProductsQuery): Promise<FetchDefectiveDamageProductsOutput> {
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

      const [defectiveDamageProducts, totalDefectiveDamageProducts] =
        await getRepository(ProductForward)
          .createQueryBuilder('f')
          .select()
          .leftJoinAndSelect('f.product', 'p')
          .leftJoinAndSelect('f.productForwardedUser', 'u')
          .where(
            sellingCountry ? `f.sellingCountry = '${sellingCountry}'` : '1 = 1',
          )
          .andWhere(product ? `productId = ${product.id}` : '1 = 1')
          .andWhere(
            '(forwardHistoryType = "defective" OR forwardHistoryType = "damage")',
          )
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy('f.id', 'DESC')
          .getManyAndCount();

      return {
        ok: true,
        totalPages: Math.ceil(totalDefectiveDamageProducts / limit),
        totalResults: totalDefectiveDamageProducts,
        defectiveDamageProducts,
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

  async editProductQuantity(
    { productId }: EditProductQuantityParam,
    { productQuantity }: EditProductQuantityInput,
    me: User,
  ): Promise<EditProductQuantityOutput> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.products.findOne({
        where: { id: productId },
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

      const existQuantity = product.productQuantity;

      const editedProduct = await queryRunner.manager
        .getRepository(Product)
        .save({
          id: product.id,
          productQuantity,
        });

      await queryRunner.manager.getRepository(ProductEditHistory).save(
        queryRunner.manager.getRepository(ProductEditHistory).create({
          editedContent: {
            existQuantity,
            editedQuantity: productQuantity,
          },
          product,
          productEditUser: me,
        }),
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        editedProduct: {
          id: editedProduct.id,
        },
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

  async fetchEditedProductsHistory({
    productId,
    page,
    limit,
  }: FetchEditedProductsHistoryQuery): Promise<FetchEditedProductsHistoryOutput> {
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

      const [editedProductHistory, totalEditedProductHistory] =
        await this.productsEditHistory.findAndCount({
          relations: ['product', 'productEditUser'],
          take: limit,
          skip: (page - 1) * limit,
          order: {
            id: 'DESC',
          },
          ...(product && {
            where: {
              product,
            },
          }),
        });

      return {
        ok: true,
        totalPages: Math.ceil(totalEditedProductHistory / limit),
        totalResults: totalEditedProductHistory,
        editedProductHistory,
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

  async deleteProduct(
    { productId }: DeleteProductParam,
    me: User,
  ): Promise<DeleteProductOutput> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.products.findOne({
        where: { id: productId },
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

      await queryRunner.manager.getRepository(Product).softDelete({
        id: product.id,
      });

      await queryRunner.manager.getRepository(ProductDeleteHistory).save(
        queryRunner.manager.getRepository(ProductDeleteHistory).create({
          product,
          productDeleteUser: me,
        }),
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        deletedProduct: {
          id: productId,
        },
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
