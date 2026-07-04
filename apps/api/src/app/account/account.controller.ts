import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import {
  AccountSettingsDto,
  ChangeEmailRequestDto,
  changeEmailRequestSchema,
} from '@job-tracker-lite-angular/schemas';
import { ZodBody } from '@job-tracker-lite-angular/core-utils';
import {
  AllowAnonymous,
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSettings(
    @Session() session: UserSession,
  ): Promise<AccountSettingsDto> {
    return this.accountService.getAccountSettings(session.user.id);
  }

  @Post('change-email')
  @UseGuards(AuthGuard)
  async changeEmail(
    @Session() session: UserSession,
    @ZodBody(changeEmailRequestSchema) body: ChangeEmailRequestDto,
  ): Promise<{ status: true }> {
    await this.accountService.requestEmailChange(
      session.user.id,
      body.newEmail,
    );
    return { status: true };
  }

  @Get('verify-email-change')
  @AllowAnonymous()
  async verifyEmailChange(
    @Query('token') token: string,
    @Res() response: Response,
  ): Promise<void> {
    const redirectUrl = await this.accountService.verifyEmailChange(token);
    response.redirect(redirectUrl);
  }

  @Get('restore-email')
  @AllowAnonymous()
  async restoreEmail(
    @Query('token') token: string,
    @Res() response: Response,
  ): Promise<void> {
    const redirectUrl = await this.accountService.restoreEmail(token);
    response.redirect(redirectUrl);
  }
}
