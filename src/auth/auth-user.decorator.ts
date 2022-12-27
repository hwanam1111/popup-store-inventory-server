import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '@src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): User => {
    const req = context.switchToHttp().getRequest();

    return req.user;
  },
);
