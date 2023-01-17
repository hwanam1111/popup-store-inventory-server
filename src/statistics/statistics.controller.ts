import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { Role } from '@src/auth/role.decorator';

import { StatisticsService } from '@src/statistics/statistics.service';

import { apiResult } from '@src/api-result';

import {
  FetchDaysRevenueOutput,
  FetchDaysRevenueQuery,
} from '@src/statistics/dtos/fetch-days-revenue.dto';

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
}
