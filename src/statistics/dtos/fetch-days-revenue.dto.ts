import { IsEnum, IsOptional } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { countryName, CountryName } from '@src/products/products.enum';
import { Timezones, timezones } from '@src/timezone/entities/timezone.entity';

class DaysRevenueChart {
  [key: string]: number;
}

export class FetchDaysRevenueQuery {
  @IsOptional()
  @IsEnum(countryName)
  country?: CountryName;

  @IsEnum(timezones)
  timezone: Timezones;
}

export class FetchDaysRevenueOutput extends CoreOutput {
  chart?: DaysRevenueChart;
}
