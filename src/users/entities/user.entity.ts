import { InternalServerErrorException } from '@nestjs/common';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { IncludeSoftDeleteCoreEntity } from '@src/common/entities/common.entity';
import { Union } from '@src/utils/union-type';

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
