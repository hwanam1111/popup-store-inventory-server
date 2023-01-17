import { IsEnum, IsOptional } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { countryName, CountryName } from '@src/products/products.enum';

class DaysRevenueChart {
  [key: string]: number;
}

export class FetchDaysRevenueQuery {
  @IsOptional()
  @IsEnum(countryName)
  country?: CountryName;
}

export class FetchDaysRevenueOutput extends CoreOutput {
  chart?: DaysRevenueChart;
}
