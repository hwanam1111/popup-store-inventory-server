import { IsString } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { User } from '@src/users/entities/user.entity';

export class LoginInput {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class LoginOutput extends CoreOutput {
  token?: string;
  user?: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}
