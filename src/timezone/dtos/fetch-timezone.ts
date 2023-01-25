import { IsEnum } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { Timezones, timezones } from '@src/timezone/entities/timezone.entity';

export class FetchTimezoneParam {
  @IsEnum(timezones)
  timezone: Timezones;
}

export class FetchTimezoneOutput extends CoreOutput {
  timezone?: Timezones;
  addOrRemoveTime?: string;
}
