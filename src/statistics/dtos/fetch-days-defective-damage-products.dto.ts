import { IsEnum, IsOptional } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { countryName, CountryName } from '@src/products/products.enum';

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
}

export class FetchDaysDefectiveDamageProductsOutput extends CoreOutput {
  chart?: DaysDefectiveDamageProductsChart;
}
