import { CoreOutput } from '@src/common/dtos/output.dto';
import { User } from '@src/users/entities/user.entity';

export class FetchMeOutput extends CoreOutput {
  me?: Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;
}
