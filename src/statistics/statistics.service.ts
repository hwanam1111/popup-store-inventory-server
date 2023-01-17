import { HttpException, Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import {
  FetchDaysRevenueOutput,
  FetchDaysRevenueQuery,
} from '@src/statistics/dtos/fetch-days-revenue.dto';

@Injectable()
export class StatisticsService {
  // constructor() {}

  async fetchDaysRevenue({
    country,
  }: FetchDaysRevenueQuery): Promise<FetchDaysRevenueOutput> {
    try {
      const daysRevenue = await getRepository(ProductForward)
        .createQueryBuilder('f')
        .select([])
        .addSelect(
          'CONCAT(MID(createdAt, 1, 4), "-", MID(createdAt, 6, 2), "-", MID(createdAt, 9, 2)) AS date',
        )
        .addSelect('SUM(f.productAmount) AS totalProductAmount')
        .where(country ? `f.sellingCountry = '${country}'` : '1 = 1')
        .groupBy('date')
        .orderBy('date', 'DESC')
        .limit(10)
        .getRawMany();

      const daysRevenueChart = {};
      daysRevenue.reverse().forEach((data) => {
        daysRevenueChart[data.date] = Number(
          data.totalProductAmount.toFixed(2),
        );
      });

      return {
        ok: true,
        chart: daysRevenueChart,
      };
    } catch (err) {
      throw new HttpException(
        {
          ok: false,
          serverError: err,
        },
        500,
      );
    }
  }
}
