import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  accountDeletionStatusSchema,
  accountSettingsSchema,
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
import { ZodBody, zodToApiSchema } from '@job-tracker-lite-angular/core-utils';
import {
  AllowAnonymous,
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { Response } from 'express';
import { AccountService } from './account.service';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get account settings',
    description:
      "Returns the current user's email, any pending email change, and verification status.",
  })
  @ApiOkResponse({ schema: zodToApiSchema(accountSettingsSchema) })
  async getSettings(
    @Session() session: UserSession,
  ): Promise<AccountSettingsDto> {
    return this.accountService.getAccountSettings(session.user.id);
  }

  @Post('change-email')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request an email change',
    description:
      'Sends a verification link to the new email address; the change only takes effect once the link is followed.',
  })
  @ApiBody({
    description:
      'New email address and the language to send the verification email in',
    schema: zodToApiSchema(changeEmailRequestSchema),
  })
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
  @ApiOperation({
    summary: 'Confirm an email change',
    description:
      'Called by clicking the verification link sent to the new email address. Applies the pending email change, then redirects the browser to the frontend. Not meaningfully callable via "Try it out" since the result is a redirect.',
  })
  @ApiQuery({
    name: 'token',
    description:
      'Email-change verification token from the link sent by POST /account/change-email',
  })
  @ApiQuery({
    name: 'language',
    description: 'Language to show the resulting frontend page in',
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to the frontend with the outcome of the verification',
  })
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
  @ApiOperation({
    summary: 'Undo a pending email change',
    description:
      'Called by clicking the "restore" link sent to the old email address when a change was requested. Cancels the pending email change, then redirects the browser to the frontend. Not meaningfully callable via "Try it out" since the result is a redirect.',
  })
  @ApiQuery({
    name: 'token',
    description:
      'Email-restore token from the link sent by POST /account/change-email',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the frontend with the outcome of the restore',
  })
  async restoreEmail(
    @Query('token') token: string,
    @Res() response: Response,
  ): Promise<void> {
    const redirectUrl = await this.accountService.restoreEmail(token);
    response.redirect(redirectUrl);
  }

  @Post('delete/request')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request account deletion',
    description:
      'Starts the grace-period deletion flow and emails a confirmation link. The account is not deleted until the link is confirmed.',
  })
  @ApiBody({
    description: 'Language to send the confirmation email in',
    schema: zodToApiSchema(deleteAccountSchema),
  })
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
  @ApiOperation({
    summary: 'Confirm account deletion',
    description:
      'Called by clicking the confirmation link sent by POST /account/delete/request. Starts the grace period for deletion, then redirects the browser to the frontend. Not meaningfully callable via "Try it out" since the result is a redirect.',
  })
  @ApiQuery({
    name: 'token',
    description:
      'Account-deletion confirmation token from the link sent by POST /account/delete/request',
  })
  @ApiQuery({
    name: 'language',
    description: 'Language to show the resulting frontend page in',
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to the frontend with the outcome of the confirmation',
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get account deletion status',
    description:
      'Returns whether the account is active or pending deletion, and the scheduled deletion date if applicable.',
  })
  @ApiOkResponse({ schema: zodToApiSchema(accountDeletionStatusSchema) })
  async getDeletionStatus(
    @Session() session: UserSession,
  ): Promise<AccountDeletionStatusDto> {
    return this.accountService.getAccountDeletionStatus(session.user.id);
  }

  @Post('delete/recover')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel a pending account deletion',
    description:
      'Reverses a previously confirmed deletion request, while still inside the grace period.',
  })
  async recoverDeletion(@Session() session: UserSession): Promise<void> {
    await this.accountService.recoverAccountDeletion(session.user.id);
  }

  @Get('export-data')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export account data',
    description:
      'Returns all data associated with the authenticated user, for download (GDPR data portability).',
  })
  async exportData(@Session() session: UserSession) {
    return this.accountService.exportUserData(session.user.id);
  }

  @Post('delete/jobs')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk delete job applications',
    description:
      'Permanently deletes the job applications matching the given filter, for the authenticated user.',
  })
  @ApiBody({
    description: 'Filter describing which job applications to delete',
    schema: zodToApiSchema(deleteJobApplicationsSchema),
  })
  async deleteJobs(
    @Session() session: UserSession,
    @ZodBody(deleteJobApplicationsSchema) body: DeleteJobApplicationsDto,
  ): Promise<{ status: true }> {
    await this.accountService.deleteJobApplications(session.user.id, body);
    return { status: true };
  }
}
