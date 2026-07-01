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

  it('GET /api/profile should hide non-visible section data', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue({
      ...userProfileFixtures.johnDoe,
      contactVisibility: false,
    });

    const res = await request(app.getHttpServer())
      .get('/api/profile')
      .expect(200);

    expect(res.body.email).toBeNull();
    expect(res.body.linkedin).toBeNull();
    expect(res.body.github).toBeNull();
    expect(res.body.webpage).toBeNull();
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
});
