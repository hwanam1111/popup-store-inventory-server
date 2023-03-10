import { Column, Entity, ManyToOne } from 'typeorm';

import { CoreEntity } from '@src/common/entities/common.entity';

import {
  CountryName,
  countryName,
  CurrencyUnit,
  currencyUnit,
  ForwardHistoryType,
  forwardHistoryType,
} from '@src/products/products.enum';

import { User } from '@src/users/entities/user.entity';
import { Product } from '@src/products/entities/product.entity';

@Entity()
export class ProductForward extends CoreEntity {
  @Column({ type: 'enum', enum: forwardHistoryType })
  forwardHistoryType: ForwardHistoryType;

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
  remainingQuantity: number;

  @Column({ length: 10000, nullable: true })
  memo?: string;

  @ManyToOne(() => Product, (product) => product.forwardedProduct, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.forwardedProduct, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  productForwardedUser: User;
}
