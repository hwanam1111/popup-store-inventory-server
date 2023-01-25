import { Controller, Get, Param, ValidationPipe } from '@nestjs/common';
import { Role } from '@src/auth/role.decorator';

import { TimezoneService } from '@src/timezone/timezone.service';

import { apiResult } from '@src/api-result';

import {
  FetchTimezoneParam,
  FetchTimezoneOutput,
} from '@src/timezone/dtos/fetch-timezone';

@Controller('v1/timezone')
export class TimezoneController {
  constructor(private readonly timezoneService: TimezoneService) {}

  @Get('/days/revenue')
  @Role(['Any'])
  async fetchTimezone(
    @Param(ValidationPipe) fetchTimezoneParam: FetchTimezoneParam,
  ): Promise<FetchTimezoneOutput> {
    return apiResult(
      await this.timezoneService.fetchTimezone(fetchTimezoneParam),
    );
  }
}
