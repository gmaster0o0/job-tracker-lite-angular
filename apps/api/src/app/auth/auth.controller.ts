import { All, Controller, Inject, Req, Res } from '@nestjs/common';

import { toNodeHandler } from 'better-auth/node';
import { Request, Response } from 'express';
import { BETTER_AUTH, BetterAuthInstance } from './auth.config';

@Controller('auth')
export class AuthController {
  private readonly authHandler: ReturnType<typeof toNodeHandler>;

  constructor(@Inject(BETTER_AUTH) private readonly auth: BetterAuthInstance) {
    this.authHandler = toNodeHandler(this.auth);
  }

  @All('*path')
  async handleAuth(@Req() request: Request, @Res() response: Response) {
    await this.authHandler(request, response);
  }
}
