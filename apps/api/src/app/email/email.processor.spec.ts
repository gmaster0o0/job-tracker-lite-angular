import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import {
  EMAIL_PROVIDER,
  SendEmailOptions,
} from './providers/email-provider.interface';
import { EmailProcessor } from './email.processor';
import { testSendOptions } from '@job-tracker-lite-angular/testing';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let emailProvider: { send: jest.Mock<Promise<void>, [SendEmailOptions]> };

  beforeEach(async () => {
    emailProvider = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: EMAIL_PROVIDER,
          useValue: emailProvider,
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  const buildJob = (data: SendEmailOptions): Job<SendEmailOptions> =>
    ({
      id: 'job-1',
      data,
      attemptsMade: 0,
    }) as Job<SendEmailOptions>;

  it('should send the email via the configured provider', async () => {
    const job = buildJob(testSendOptions);

    await processor.process(job);

    expect(emailProvider.send).toHaveBeenCalledWith(testSendOptions);
  });

  it('should rethrow provider errors so BullMQ can retry the job', async () => {
    const providerError = new Error('smtp failed');
    emailProvider.send.mockRejectedValueOnce(providerError);

    const job = buildJob(testSendOptions);

    await expect(processor.process(job)).rejects.toThrow(providerError);
  });
});
