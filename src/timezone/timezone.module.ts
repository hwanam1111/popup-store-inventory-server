import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Timezone } from '@src/timezone/entities/timezone.entity';
import { TimezoneController } from '@src/timezone/timezone.controller';
import { TimezoneService } from '@src/timezone/timezone.service';

@Module({
  imports: [TypeOrmModule.forFeature([Timezone])],
  controllers: [TimezoneController],
  providers: [TimezoneService],
  exports: [TimezoneService],
})
export class TimezoneModule {}
