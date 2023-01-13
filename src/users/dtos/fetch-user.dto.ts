import { IsNotEmpty, IsNumber } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { User } from '@src/users/entities/user.entity';

export class FetchUserParam {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}

export class FetchUserOutput extends CoreOutput {
  user?: User;
}
