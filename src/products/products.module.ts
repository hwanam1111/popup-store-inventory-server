import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '@src/products/entities/product.entity';
import { ProductForward } from '@src/products/entities/product-forward-history.entity';
import { ProductEditHistory } from '@src/products/entities/product-edit-history.entity';
import { ProductsController } from '@src/products/products.controller';
import { ProductsService } from '@src/products/products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductForward, ProductEditHistory]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
