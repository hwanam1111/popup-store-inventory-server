import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { Role } from '@src/auth/role.decorator';

import { StatisticsService } from '@src/statistics/statistics.service';

import { apiResult } from '@src/api-result';

import {
  FetchDaysRevenueOutput,
  FetchDaysRevenueQuery,
} from '@src/statistics/dtos/fetch-days-revenue.dto';
import {
  FetchDaysForwardedProductsQuery,
  FetchDaysForwardedProductsOutput,
} from '@src/statistics/dtos/fetch-days-forwarded-products.dto';
import {
  FetchDaysDefectiveDamageProductsQuery,
  FetchDaysDefectiveDamageProductsOutput,
} from '@src/statistics/dtos/fetch-days-defective-damage-products.dto';
import {
  FetchDaysSynthesisQuery,
  FetchDaysSynthesisOutput,
} from '@src/statistics/dtos/fetch-days-synthesis.dto';

@Controller('v1/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('/days/revenue')
  @Role(['Any'])
  async fetchDaysRevenue(
    @Query(ValidationPipe) fetchDaysRevenueQuery: FetchDaysRevenueQuery,
  ): Promise<FetchDaysRevenueOutput> {
    return apiResult(
      await this.statisticsService.fetchDaysRevenue(fetchDaysRevenueQuery),
    );
  }

  @Get('/days/forwarded-products-count')
  @Role(['Any'])
  async fetchDaysForwardedProductsCount(
    @Query(ValidationPipe)
    fetchDaysForwardedProductsQuery: FetchDaysForwardedProductsQuery,
  ): Promise<FetchDaysForwardedProductsOutput> {
    return apiResult(
      await this.statisticsService.fetchDaysForwardedProductsCount(
        fetchDaysForwardedProductsQuery,
      ),
    );
  }

  @Get('/days/defective-damage-products-count')
  @Role(['Any'])
  async fetchDefectiveDamageProductsCount(
    @Query(ValidationPipe)
    fetchDaysDefectiveDamageProductsQuery: FetchDaysDefectiveDamageProductsQuery,
  ): Promise<FetchDaysDefectiveDamageProductsOutput> {
    return apiResult(
      await this.statisticsService.fetchDefectiveDamageProductsCount(
        fetchDaysDefectiveDamageProductsQuery,
      ),
    );
  }

  @Get('/days/synthesis')
  @Role(['Any'])
  async fetchDaysSynthesis(
    @Query(ValidationPipe)
    fetchDaysSynthesisQuery: FetchDaysSynthesisQuery,
  ): Promise<FetchDaysSynthesisOutput> {
    return apiResult(
      await this.statisticsService.fetchDaysSynthesis(fetchDaysSynthesisQuery),
    );
  }
}
