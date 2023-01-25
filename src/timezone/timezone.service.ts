import { HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Timezone } from '@src/timezone/entities/timezone.entity';

import {
  FetchTimezoneOutput,
  FetchTimezoneParam,
} from '@src/timezone/dtos/fetch-timezone';

@Injectable()
export class TimezoneService {
  constructor(
    @InjectRepository(Timezone) private readonly timezone: Repository<Timezone>,
  ) {}

  async fetchTimezone({
    timezone,
  }: FetchTimezoneParam): Promise<FetchTimezoneOutput> {
    try {
      const tz = await this.timezone.findOne({
        where: {
          timezone,
        },
      });

      return {
        ok: true,
        timezone: tz.timezone,
        addOrRemoveTime: tz.addOrRemoveTime,
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
