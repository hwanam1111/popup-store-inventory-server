import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from '@src/users/users.service';
import { AllowedRoles } from '@src/auth/role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-jwt'];

    if (!token) {
      return false;
    }

    const decoded = this.jwtService.verify(token.toString());
    if (decoded === 'expired-token') {
      throw new HttpException(
        {
          ok: false,
          error: 'expired-token',
        },
        401,
      );
    }

    if (decoded === 'invalid-token') {
      throw new HttpException(
        {
          ok: false,
          error: 'invalid-token',
        },
        401,
      );
    }

    if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
      const { user } = await this.userService.fetchUser({
        userId: decoded['id'],
      });

      if (!user) {
        throw new HttpException(
          {
            ok: false,
            error: 'user-not-found',
          },
          401,
        );
      }

      req.user = user;

      return roles.includes(user.role) || roles.includes('Any');
    }

    return false;
  }
}
