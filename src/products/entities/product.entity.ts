import { Column, Entity, ManyToOne } from 'typeorm';

import { Union } from '@src/utils/union-type';

import { IncludeSoftDeleteCoreEntity } from '@src/common/entities/common.entity';
import { User } from '@src/users/entities/user.entity';

const currencyUnit = {
  KRW: 'KRW',
  EUR: 'EUR',
  USD: 'USD',
} as const;
export type CurrencyUnit = Union<typeof currencyUnit>;

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

  @ManyToOne(() => User, (user) => user.createdProducts)
  createdUser: User;
}
