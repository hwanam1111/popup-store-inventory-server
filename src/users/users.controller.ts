import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';

import { apiResult } from '@src/api-result';

import { UsersService } from '@src/users/users.service';

import {
  CreateAccountInput,
  CreateAccountOutput,
} from '@src/users/dtos/create-account.dto';
import { LoginInput, LoginOutput } from '@src/users/dtos/login.dto';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  async createAccount(
    @Body(ValidationPipe) createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return apiResult(await this.usersService.createAccount(createAccountInput));
  }

  @Post('/login')
  async login(
    @Body(ValidationPipe) loginInput: LoginInput,
  ): Promise<LoginOutput> {
    return apiResult(await this.usersService.login(loginInput));
  }
}
