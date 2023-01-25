import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatisticsController } from '@src/statistics/statistics.controller';
import { StatisticsService } from '@src/statistics/statistics.service';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import { Timezone } from '@src/timezone/entities/timezone.entity';
import { TimezoneService } from '@src/timezone/timezone.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductForward, Timezone])],
  controllers: [StatisticsController],
  providers: [StatisticsService, TimezoneService],
})
export class StatisticsModule {}
