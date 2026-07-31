import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountService } from './account.service';

@Injectable()
export class EmailChangeTokenHousekeepingScheduler {
  private readonly logger = new Logger(
    EmailChangeTokenHousekeepingScheduler.name,
  );

  constructor(private readonly accountService: AccountService) {}

  // Offset from AccountDeletionScheduler's midnight run so the two maintenance
  // jobs do not contend for the same rows.
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleHousekeepingJob(): Promise<void> {
    const { deletedTokens, clearedPendingEmails } =
      await this.accountService.purgeExpiredEmailChangeTokens();

    if (deletedTokens > 0 || clearedPendingEmails > 0) {
      this.logger.log(
        `Purged ${deletedTokens} expired email change token(s) and cleared ${clearedPendingEmails} orphaned pending email(s)`,
      );
    }
  }
}
