import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountService } from './account.service';

@Injectable()
export class AccountDeletionScheduler {
  private readonly logger = new Logger(AccountDeletionScheduler.name);

  constructor(private readonly accountService: AccountService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDeletionJob(): Promise<void> {
    const deletedUsers = await this.accountService.executeScheduledDeletion();

    if (deletedUsers > 0) {
      this.logger.log(
        `Deleted ${deletedUsers} user account(s) after grace period`,
      );
    }
  }
}
