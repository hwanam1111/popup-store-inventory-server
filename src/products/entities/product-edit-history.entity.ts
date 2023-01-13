import { Column, Entity, ManyToOne } from 'typeorm';

import { CoreEntity } from '@src/common/entities/common.entity';

import { User } from '@src/users/entities/user.entity';
import { Product } from '@src/products/entities/product.entity';

export class EditContent {
  existQuantity?: number;
  editedQuantity?: number;
}

@Entity()
export class ProductEditHistory extends CoreEntity {
  @Column({ type: 'json' })
  editedContent: EditContent;

  @ManyToOne(() => Product, (product) => product.editProductHistory, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.editProductHistory, {
    onDelete: 'NO ACTION',
    nullable: false,
  })
  productEditUser: User;
}
