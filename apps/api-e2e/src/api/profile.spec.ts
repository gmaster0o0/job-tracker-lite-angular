import { Test } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { ProfileModule } from '@job-tracker-lite-angular/api/app/profile/profile.module';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import {
  createPrismaServiceMock,
  userProfileFixtures,
  authSessionFixtures,
  updateUserProfileFixtures,
} from '@job-tracker-lite-angular/testing';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

describe('api/profile (e2e)', () => {
  let app: INestApplication;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;

  const visibilityCases = [
    { level: 0, audience: 'private' },
    { level: 10, audience: 'recruiters' },
    { level: 20, audience: 'registered users' },
    { level: 30, audience: 'public' },
  ];

  const mockAuthGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.session = authSessionFixtures.authenticated;
      return true;
    },
  };

  beforeAll(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      imports: [ProfileModule],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/profile', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue(
      userProfileFixtures.johnDoe,
    );

    const res = await request(app.getHttpServer())
      .get('/api/profile')
      .expect(200);

    expect(res.body.name).toBe(userProfileFixtures.johnDoe.name);
  });

  it('PATCH /api/profile', async () => {
    prismaMock.userProfile.upsert.mockResolvedValue({
      ...userProfileFixtures.johnDoe,
      title: 'Lead Software Engineer',
    });

    const updateDto = updateUserProfileFixtures.updateJohnDoe;

    const res = await request(app.getHttpServer())
      .patch('/api/profile')
      .send(updateDto)
      .expect(200);

    expect(res.body.title).toBe('Lead Software Engineer');
  });

  it.each(visibilityCases)(
    'PATCH /api/profile accepts visibility level $level ($audience)',
    async ({ level }) => {
      prismaMock.userProfile.upsert.mockResolvedValue({
        ...userProfileFixtures.johnDoe,
        isPublic: level,
        personalVisibility: level,
        contactVisibility: level,
        skillsVisibility: level,
        preferenceVisibility: level,
      });

      const res = await request(app.getHttpServer())
        .patch('/api/profile')
        .send({
          isPublic: level,
          personalVisibility: level,
          contactVisibility: level,
          skillsVisibility: level,
          preferenceVisibility: level,
        })
        .expect(200);

      expect(res.body.isPublic).toBe(level);
      expect(res.body.personalVisibility).toBe(level);
      expect(res.body.contactVisibility).toBe(level);
      expect(res.body.skillsVisibility).toBe(level);
      expect(res.body.preferenceVisibility).toBe(level);
    },
  );
});
