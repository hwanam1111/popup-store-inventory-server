import { Entity, ManyToOne } from 'typeorm';

import { CoreEntity } from '@src/common/entities/common.entity';

import { User } from '@src/users/entities/user.entity';
import { Product } from '@src/products/entities/product.entity';

@Entity()
export class ProductDeleteHistory extends CoreEntity {
  @ManyToOne(() => Product, (product) => product.deleteProductHistory, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.deleteProductHistory, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  productDeleteUser: User;
}
