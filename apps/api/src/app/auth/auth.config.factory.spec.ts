import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import {
  createEmailServiceMock,
  createPrismaServiceMock,
} from '@job-tracker-lite-angular/testing';

// better-auth and its adapter ship ESM-only dependency trees Jest can't parse
// under this project's CJS transform. Neither is called by the methods under
// test (only by AuthConfigFactory.create(), which this spec never invokes),
// so the module boundary is mocked out rather than transforming node_modules.
jest.mock('better-auth', () => ({ betterAuth: jest.fn() }));
jest.mock('@better-auth/prisma-adapter', () => ({ prismaAdapter: jest.fn() }));

import { AuthConfigFactory } from './auth.config.factory';

describe('AuthConfigFactory', () => {
  let factory: AuthConfigFactory;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthConfigFactory,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: createEmailServiceMock(jest.fn) },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    factory = moduleRef.get(AuthConfigFactory);
  });

  describe('nextNumberedSlug', () => {
    it('starts at 2 when there are no numbered duplicates yet', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await expect(factory.nextNumberedSlug('demo-user')).resolves.toBe(
        'demo-user-2',
      );
    });

    it('picks the numeric max, not the lexicographic max', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { slug: 'demo-user-9' },
        { slug: 'demo-user-10' },
        { slug: 'demo-user-2' },
      ]);

      await expect(factory.nextNumberedSlug('demo-user')).resolves.toBe(
        'demo-user-11',
      );
    });

    it('ignores slugs with a non-numeric suffix', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { slug: 'demo-user-a1b2c3d4' },
        { slug: 'demo-user-2' },
      ]);

      await expect(factory.nextNumberedSlug('demo-user')).resolves.toBe(
        'demo-user-3',
      );
    });

    it('queries only slugs sharing the base prefix', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await factory.nextNumberedSlug('demo-user');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { slug: { startsWith: 'demo-user-' } },
        select: { slug: true },
      });
    });
  });

  describe('generateUniqueUserSlug', () => {
    it('returns the base slug when it is free', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const slug = await factory.generateUniqueUserSlug('Demo User');

      expect(slug).toBe('demo-user');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { slug: 'demo-user' },
        select: { id: true },
      });
    });

    it('falls back to "user" for a name with no slug-able characters', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(factory.generateUniqueUserSlug('!!!')).resolves.toBe('user');
    });

    it('appends -2 when the base slug is taken', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'existing' })
        .mockResolvedValueOnce(null);
      prismaMock.user.findMany.mockResolvedValue([]);

      await expect(factory.generateUniqueUserSlug('Demo User')).resolves.toBe(
        'demo-user-2',
      );
    });

    it('continues the sequence past existing numbered duplicates', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'existing' })
        .mockResolvedValueOnce(null);
      prismaMock.user.findMany.mockResolvedValue([
        { slug: 'demo-user-2' },
        { slug: 'demo-user-9' },
        { slug: 'demo-user-3' },
      ]);

      await expect(factory.generateUniqueUserSlug('Demo User')).resolves.toBe(
        'demo-user-10',
      );
    });

    it('retries with the next number when a numbered candidate also loses the race', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'existing' }) // base taken
        .mockResolvedValueOnce({ id: 'existing-2' }) // -2 taken by a concurrent signup
        .mockResolvedValueOnce(null); // -3 free
      prismaMock.user.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ slug: 'demo-user-2' }]);

      await expect(factory.generateUniqueUserSlug('Demo User')).resolves.toBe(
        'demo-user-3',
      );
    });

    it('falls back to a random suffix after exhausting all attempts', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' });
      prismaMock.user.findMany.mockResolvedValue([]);

      const slug = await factory.generateUniqueUserSlug('Demo User');

      expect(slug).toMatch(/^demo-user-[0-9a-f]{32}$/);
    });
  });
});
