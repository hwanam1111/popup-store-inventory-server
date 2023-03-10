import { InternalServerErrorException } from '@nestjs/common';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Union } from '@src/utils/union-type';

import { IncludeSoftDeleteCoreEntity } from '@src/common/entities/common.entity';
import { Product } from '@src/products/entities/product.entity';
import { ProductForward } from '@src/products/entities/product-forward-history.entity';
import { ProductEditHistory } from '@src/products/entities/product-edit-history.entity';
import { ProductDeleteHistory } from '@src/products/entities/product-delete-history.entity';

const userRole = {
  ReadOnly: 'ReadOnly',
  Manager: 'Manager',
  RootAdmin: 'RootAdmin',
} as const;
export type UserRole = Union<typeof userRole>;

@Entity()
export class User extends IncludeSoftDeleteCoreEntity {
  @Column({ length: 254 })
  email: string;

  @Column({ select: false, length: 255 })
  password: string;

  @Column({ type: 'enum', enum: userRole, default: userRole.ReadOnly })
  role: UserRole;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Product, (product) => product.createdUser)
  createdProducts: Product[];

  @OneToMany(
    () => ProductForward,
    (productForward) => productForward.productForwardedUser,
  )
  forwardedProduct: ProductForward[];

  @OneToMany(
    () => ProductEditHistory,
    (productEditHistory) => productEditHistory.productEditUser,
  )
  editProductHistory: ProductEditHistory[];

  @OneToMany(
    () => ProductDeleteHistory,
    (productDeleteHistory) => productDeleteHistory.productDeleteUser,
  )
  deleteProductHistory: ProductDeleteHistory[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassowrd(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 11);
      } catch (err) {
        console.log(err);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(enteredPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
