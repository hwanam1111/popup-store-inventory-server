import { CoreEntity } from '@src/common/entities/common.entity';
import { Union } from '@src/utils/union-type';
import { Column, Entity } from 'typeorm';

export const timezones = {
  'Asia/Seoul': 'Asia/Seoul',
  'Europe/Berlin': 'Europe/Berlin',
  'Europe/Brussels': 'Europe/Brussels',
  'Europe/Madrid': 'Europe/Madrid',
  'Europe/Paris': 'Europe/Paris',
} as const;
export type Timezones = Union<typeof timezones>;

@Entity()
export class Timezone extends CoreEntity {
  @Column({ type: 'enum', enum: timezones })
  timezone: Timezones;

  @Column()
  addOrRemoveTime: string;
}
