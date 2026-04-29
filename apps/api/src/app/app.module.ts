import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@job-tracker-lite-angular/prisma';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [PrismaModule, JobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
