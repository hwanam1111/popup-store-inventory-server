import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@src/users/entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from '@src/users/dtos/create-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    name,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const isAlreadyUsedEmail = await this.users.findOne({ email });
      if (isAlreadyUsedEmail) {
        return {
          ok: false,
          error: {
            statusType: 'FORBIDDEN',
            statusCode: 403,
            message: 'already-used-email',
          },
        };
      }

      const createdUser = await this.users.save(
        this.users.create({
          email,
          password,
          name,
        }),
      );

      return {
        ok: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
        },
      };
    } catch (err) {
      throw new HttpException(
        {
          ok: false,
          error: err,
        },
        500,
      );
    }
  }
}
