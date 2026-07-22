import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { PreferencesService } from './preferences.service';
import {
  authUserIdFixture,
  createPrismaServiceMock,
  userPreferencesFixtures,
  updateUserPreferencesFixtures,
} from '@job-tracker-lite-angular/testing';

describe('PreferencesService', () => {
  let service: PreferencesService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      providers: [
        PreferencesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = moduleRef.get(PreferencesService);
  });

  it('should return stored preferences', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      preferences: userPreferencesFixtures.johnDoe,
    });

    const result = await service.getPreferences(authUserIdFixture);

    expect(result).toEqual(userPreferencesFixtures.johnDoe);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: authUserIdFixture },
      select: { preferences: true },
    });
  });

  it('should return defaults when no preferences are stored yet', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ preferences: null });

    const result = await service.getPreferences(authUserIdFixture);

    expect(result).toEqual(userPreferencesFixtures.default);
  });

  it('should merge a partial update onto the current preferences and persist it', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      preferences: userPreferencesFixtures.johnDoe,
    });
    prismaMock.user.update.mockResolvedValue({});

    const updateDto = updateUserPreferencesFixtures.updateTheme;
    const result = await service.updatePreferences(
      authUserIdFixture,
      updateDto,
    );

    const expected = { ...userPreferencesFixtures.johnDoe, ...updateDto };
    expect(result).toEqual(expected);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: authUserIdFixture },
      data: { preferences: expected },
    });
  });

  it('should always take the client-supplied updatedAt, never override it', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ preferences: null });
    prismaMock.user.update.mockResolvedValue({});

    const updateDto = updateUserPreferencesFixtures.updateTheme;
    const result = await service.updatePreferences(
      authUserIdFixture,
      updateDto,
    );

    expect(result.updatedAt).toBe(updateDto.updatedAt);
  });
});
