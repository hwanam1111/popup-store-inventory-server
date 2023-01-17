import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatisticsController } from '@src/statistics/statistics.controller';
import { StatisticsService } from '@src/statistics/statistics.service';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductForward])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
