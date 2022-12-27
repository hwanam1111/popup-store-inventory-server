import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { CONFIG_OPTIONS } from '@src/common/common.constants';
import { JwtModuleOptions } from '@src/jwt/jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey, {
      expiresIn: '365d',
    });
  }

  verify(token: string): string | object {
    try {
      return jwt.verify(token, this.options.privateKey);
    } catch (err) {
      if (err.message === 'jwt expired') {
        return 'expired-token';
      }

      if (err.message === 'invalid signature') {
        return 'invalid-token';
      }

      return 'unauthenticated';
    }
  }
}
