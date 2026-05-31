import { Module } from '@nestjs/common';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { EmailModule } from '../email/email.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
