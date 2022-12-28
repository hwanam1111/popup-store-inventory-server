import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '@src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  // controllers: [UsersController],
  // providers: [UsersService],
  // exports: [UsersService],
})
export class ProductsModule {}
