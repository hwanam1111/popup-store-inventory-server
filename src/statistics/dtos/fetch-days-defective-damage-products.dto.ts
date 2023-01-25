import { IsEnum, IsOptional } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { countryName, CountryName } from '@src/products/products.enum';
import { Timezones, timezones } from '@src/timezone/entities/timezone.entity';

class DaysDefectiveDamageProductsChart {
  [key: string]: {
    defective: number[];
    damage: number[];
  };
}

export class FetchDaysDefectiveDamageProductsQuery {
  @IsOptional()
  @IsEnum(countryName)
  country?: CountryName;

  @IsEnum(timezones)
  timezone: Timezones;
}

export class FetchDaysDefectiveDamageProductsOutput extends CoreOutput {
  chart?: DaysDefectiveDamageProductsChart;
}
