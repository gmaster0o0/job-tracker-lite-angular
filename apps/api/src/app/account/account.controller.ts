import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import {
  AccountDeletionStatusDto,
  AccountSettingsDto,
  ChangeEmailRequestDto,
  DeleteAccountDto,
  SupportLang,
  changeEmailRequestSchema,
  deleteAccountSchema,
  DeleteJobApplicationsDto,
  deleteJobApplicationsSchema,
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
      body.language,
    );
    return { status: true };
  }

  @Get('verify-email-change')
  @AllowAnonymous()
  async verifyEmailChange(
    @Query('token') token: string,
    @Query('language') language: SupportLang,
    @Res() response: Response,
  ): Promise<void> {
    const redirectUrl = await this.accountService.verifyEmailChange(
      token,
      language,
    );
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

  @Post('delete/request')
  @UseGuards(AuthGuard)
  async requestAccountDeletion(
    @Session() session: UserSession,
    @ZodBody(deleteAccountSchema) body: DeleteAccountDto,
  ): Promise<{ status: true }> {
    await this.accountService.requestAccountDeletion(
      session.user.id,
      body.language,
    );
    return { status: true };
  }

  @Get('confirm-delete')
  @AllowAnonymous()
  async confirmAccountDeletion(
    @Query('token') token: string,
    @Query('language') language: SupportLang,
    @Res() response: Response,
  ): Promise<void> {
    const redirectUrl = await this.accountService.confirmAccountDeletion(
      token,
      language,
    );
    response.redirect(redirectUrl);
  }

  @Get('delete/status')
  @UseGuards(AuthGuard)
  async getDeletionStatus(
    @Session() session: UserSession,
  ): Promise<AccountDeletionStatusDto> {
    return this.accountService.getAccountDeletionStatus(session.user.id);
  }

  @Post('delete/recover')
  @UseGuards(AuthGuard)
  async recoverDeletion(@Session() session: UserSession): Promise<void> {
    await this.accountService.recoverAccountDeletion(session.user.id);
  }

  @Get('export-data')
  @UseGuards(AuthGuard)
  async exportData(@Session() session: UserSession) {
    return this.accountService.exportUserData(session.user.id);
  }

  @Post('delete/jobs')
  @UseGuards(AuthGuard)
  async deleteJobs(
    @Session() session: UserSession,
    @ZodBody(deleteJobApplicationsSchema) body: DeleteJobApplicationsDto,
  ): Promise<{ status: true }> {
    await this.accountService.deleteJobApplications(
      session.user.id,
      body.email,
    );
    return { status: true };
  }
}
