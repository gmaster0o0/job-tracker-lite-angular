import { Module } from '@nestjs/common';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { EmailModule } from '../email/email.module';
import { AccountController } from './account.controller';
import { AccountDeletionScheduler } from './account-deletion.scheduler';
import { AccountService } from './account.service';
import { EmailChangeTokenHousekeepingScheduler } from './email-change-token-housekeeping.scheduler';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountDeletionScheduler,
    EmailChangeTokenHousekeepingScheduler,
  ],
})
export class AccountModule {}
