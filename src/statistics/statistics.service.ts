import { HttpException, Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';

import { ProductForward } from '@src/products/entities/product-forward-history.entity';

import { TimezoneService } from '@src/timezone/timezone.service';

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

@Injectable()
export class StatisticsService {
  constructor(private readonly timezoneService: TimezoneService) {}

  async fetchDaysRevenue({
    country,
    timezone,
  }: FetchDaysRevenueQuery): Promise<FetchDaysRevenueOutput> {
    try {
      const { addOrRemoveTime } = await this.timezoneService.fetchTimezone({
        timezone,
      });
      const daysRevenue = await getRepository(ProductForward)
        .createQueryBuilder('f')
        .select([])
        .addSelect(
          `CONCAT(MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 1, 4), "-", MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 6, 2), "-", MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 9, 2)) AS date`,
        )
        .addSelect('SUM(f.productAmount) AS totalProductAmount')
        .where(country ? `f.sellingCountry = '${country}'` : '1 = 1')
        .andWhere('f.forwardHistoryType = "Forwarding"')
        .groupBy('date')
        .orderBy('date', 'DESC')
        .limit(10)
        .getRawMany();

      const daysRevenueChart = {};
      for (const dayRevenue of daysRevenue.reverse()) {
        const { totalCanceledAmount } = await getRepository(ProductForward)
          .createQueryBuilder('f')
          .select([])
          .addSelect('SUM(f.productAmount) AS totalCanceledAmount')
          .where(country ? `f.sellingCountry = '${country}'` : '1 = 1')
          .andWhere('forwardHistoryType = "Cancel"')
          .andWhere(
            `DATE(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}")) = '${dayRevenue.date}'`,
          )
          .getRawOne();

        daysRevenueChart[dayRevenue.date] = Number(
          (
            Number(dayRevenue.totalProductAmount) - Number(totalCanceledAmount)
          ).toFixed(2),
        );
      }

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

  async fetchDaysForwardedProductsCount({
    country,
    timezone,
  }: FetchDaysForwardedProductsQuery): Promise<FetchDaysForwardedProductsOutput> {
    try {
      const { addOrRemoveTime } = await this.timezoneService.fetchTimezone({
        timezone,
      });
      const daysForwardedProducts = await getRepository(ProductForward)
        .createQueryBuilder('f')
        .select([])
        .addSelect(
          `CONCAT(MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 1, 4), "-", MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 6, 2), "-", MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 9, 2)) AS date`,
        )
        .addSelect('COUNT(f.id) AS totalForwardedCount')
        .where(country ? `f.sellingCountry = '${country}'` : '1 = 1')
        .andWhere('forwardHistoryType = "Forwarding"')
        .groupBy('date')
        .orderBy('date', 'DESC')
        .limit(10)
        .getRawMany();

      const daysForwardedProductsChart = {};
      for (const daysForwardedProductsCount of daysForwardedProducts.reverse()) {
        const { totalCanceledCount } = await getRepository(ProductForward)
          .createQueryBuilder('f')
          .select([])
          .addSelect('COUNT(f.id) AS totalCanceledCount')
          .where(country ? `f.sellingCountry = '${country}'` : '1 = 1')
          .andWhere('forwardHistoryType = "Cancel"')
          .andWhere(
            `DATE(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}")) = '${daysForwardedProductsCount}'`,
          )
          .getRawOne();

        daysForwardedProductsChart[daysForwardedProductsCount.date] = Number(
          daysForwardedProductsCount.totalForwardedCount - totalCanceledCount,
        );
      }

      return {
        ok: true,
        chart: daysForwardedProductsChart,
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

  async fetchDefectiveDamageProductsCount({
    country,
    timezone,
  }: FetchDaysDefectiveDamageProductsQuery): Promise<FetchDaysDefectiveDamageProductsOutput> {
    try {
      const { addOrRemoveTime } = await this.timezoneService.fetchTimezone({
        timezone,
      });
      const defectiveDamageProductsCount = await getRepository(ProductForward)
        .createQueryBuilder('f')
        .select(['f.forwardHistoryType AS forwardHistoryType'])
        .addSelect(
          `CONCAT(MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 1, 4), "-", MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 6, 2), "-", MID(CONVERT_TZ(createdAt, "+00:00", "${addOrRemoveTime}"), 9, 2)) AS date`,
        )
        .addSelect('COUNT(f.id) AS totalDefectiveDamageCount')
        .where(country ? `f.sellingCountry = '${country}'` : '1 = 1')
        .andWhere(
          '(forwardHistoryType = "Defective" OR forwardHistoryType = "Damage")',
        )
        .groupBy('date')
        .addGroupBy('forwardHistoryType')
        .orderBy('date', 'DESC')
        .limit(10)
        .getRawMany();

      const defectiveDamageProductsCountChart = {};
      defectiveDamageProductsCount.reverse().forEach((data) => {
        if (defectiveDamageProductsCountChart[data.date] === undefined) {
          defectiveDamageProductsCountChart[data.date] = {
            defective: 0,
            damage: 0,
          };
        }

        switch (data.forwardHistoryType) {
          case 'Defective':
            defectiveDamageProductsCountChart[data.date]['defective'] = Number(
              data.totalDefectiveDamageCount,
            );
            break;
          case 'Damage':
            defectiveDamageProductsCountChart[data.date]['damage'] = Number(
              data.totalDefectiveDamageCount,
            );
            break;
          default:
            break;
        }
      });

      return {
        ok: true,
        chart: defectiveDamageProductsCountChart,
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
