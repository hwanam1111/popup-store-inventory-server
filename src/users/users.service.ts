import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@src/users/entities/user.entity';

import { JwtService } from '@src/jwt/jwt.service';

import {
  CreateAccountInput,
  CreateAccountOutput,
} from '@src/users/dtos/create-account.dto';
import {
  FetchUserOutput,
  FetchUserParam,
} from '@src/users/dtos/fetch-user.dto';
import { LoginInput, LoginOutput } from '@src/users/dtos/login.dto';
import { FetchMeOutput } from '@src/users/dtos/fetch-me.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
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
          serverError: err,
        },
        500,
      );
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        {
          select: ['id', 'password', 'role', 'name', 'email'],
        },
      );

      if (!user) {
        return {
          ok: true,
          error: {
            statusType: 'UNAUTHORIZED',
            statusCode: 401,
            message: 'user-not-found',
          },
        };
      }

      const isPasswordCorrect = await user.checkPassword(password);
      if (!isPasswordCorrect) {
        return {
          ok: true,
          error: {
            statusType: 'UNAUTHORIZED',
            statusCode: 401,
            message: 'user-not-found',
          },
        };
      }

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (err) {
      throw new HttpException(
        {
          serverError: err,
        },
        500,
      );
    }
  }

  async fetchUser({ userId }: FetchUserParam): Promise<FetchUserOutput> {
    try {
      const user = await this.users.findOne({ id: userId });

      if (!user) {
        return {
          ok: false,
          error: {
            statusType: 'NOT_FOUND',
            statusCode: 404,
            message: 'user-not-found',
          },
        };
      }

      return {
        ok: true,
        user,
      };
    } catch (err) {
      throw new HttpException(
        {
          serverError: err,
        },
        500,
      );
    }
  }

  async fetchMe(me: User): Promise<FetchMeOutput> {
    try {
      if (!me) {
        return {
          ok: true,
          me: null,
        };
      }

      const { id, email, name, role, createdAt } = me;

      return {
        ok: true,
        me: {
          id,
          email,
          name,
          role,
          createdAt,
        },
      };
    } catch (err) {
      throw new HttpException(
        {
          serverError: err,
        },
        500,
      );
    }
  }
}
