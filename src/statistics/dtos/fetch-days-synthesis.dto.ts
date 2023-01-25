import { IsEnum, IsString } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { countryName, CountryName } from '@src/products/products.enum';
import { Timezones, timezones } from '@src/timezone/entities/timezone.entity';
import { Product } from '@src/products/entities/product.entity';

export class FetchDaysSynthesisQuery {
  @IsEnum(countryName)
  country: CountryName;

  @IsEnum(timezones)
  timezone: Timezones;

  @IsString()
  selectDate: string;
}

export class FetchDaysSynthesisOutput extends CoreOutput {
  result?: (Pick<
    Product,
    'id' | 'barcode' | 'productName' | 'sellingCurrency' | 'productAmount'
  > & {
    productForwardCount: number;
    productForwardCancelCount: number;
    productDefectiveCount: number;
    productDamageCount: number;
  })[];
}
