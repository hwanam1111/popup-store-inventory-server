import { IsEnum, IsOptional } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { countryName, CountryName } from '@src/products/products.enum';

class DaysForwardedProductsChart {
  [key: string]: number;
}

export class FetchDaysForwardedProductsQuery {
  @IsOptional()
  @IsEnum(countryName)
  country?: CountryName;
}

export class FetchDaysForwardedProductsOutput extends CoreOutput {
  chart?: DaysForwardedProductsChart;
}
