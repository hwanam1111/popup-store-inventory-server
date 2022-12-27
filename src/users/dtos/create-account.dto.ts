import { IsEmail, Length, IsString } from 'class-validator';

import { CoreOutput } from '@src/common/dtos/output.dto';
import { User } from '@src/users/entities/user.entity';

export class CreateAccountInput {
  @IsEmail()
  @Length(3, 254)
  email: string;

  @IsString()
  @Length(8, 20)
  password: string;

  @IsString()
  @Length(1, 100)
  name: string;
}

export class CreateAccountOutput extends CoreOutput {
  user?: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}
