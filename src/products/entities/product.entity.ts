import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import {
  CountryName,
  countryName,
  CurrencyUnit,
  currencyUnit,
} from '@src/products/products.enum';

import { IncludeSoftDeleteCoreEntity } from '@src/common/entities/common.entity';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';
import { ProductEditHistory } from '@src/products/entities/product-edit-history.entity';
import { User } from '@src/users/entities/user.entity';

@Entity()
export class Product extends IncludeSoftDeleteCoreEntity {
  @Column({ length: 100 })
  barcode: string;

  @Column({ length: 500 })
  productName: string;

  @Column({ length: 300 })
  productImage: string;

  @Column({ type: 'double' })
  productAmount: number;

  @Column({ type: 'enum', enum: currencyUnit })
  sellingCurrency: CurrencyUnit;

  @Column({ type: 'enum', enum: countryName })
  sellingCountry: CountryName;

  @Column({ type: 'int' })
  productQuantity: number;

  @ManyToOne(() => User, (user) => user.createdProducts, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  createdUser: User;

  @OneToMany(() => ProductForward, (productForward) => productForward.product)
  forwardedProduct: ProductForward[];

  @OneToMany(
    () => ProductEditHistory,
    (productEditHistory) => productEditHistory.product,
  )
  editProductHistory: ProductEditHistory[];
}
