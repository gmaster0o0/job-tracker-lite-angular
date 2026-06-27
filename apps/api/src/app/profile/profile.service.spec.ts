import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { ProfileService } from './profile.service';
import {
  authUserIdFixture,
  createPrismaServiceMock,
  userProfileFixtures,
  updateUserProfileFixtures,
} from '@job-tracker-lite-angular/testing';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = moduleRef.get(ProfileService);
  });

  it('should return an existing profile', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue(
      userProfileFixtures.johnDoe,
    );

    const result = await service.getProfile(authUserIdFixture);
    expect(result).toEqual(userProfileFixtures.johnDoe);
    expect(prismaMock.userProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: authUserIdFixture },
    });
  });

  it('should create a blank profile if none exists', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue(null);
    prismaMock.userProfile.create.mockResolvedValue(userProfileFixtures.empty);

    const result = await service.getProfile(authUserIdFixture);
    expect(result).toEqual({
      ...userProfileFixtures.empty,
    });
    expect(prismaMock.userProfile.create).toHaveBeenCalledWith({
      data: {
        userId: authUserIdFixture,
        coreSkills: [],
      },
    });
  });

  it('should update a profile using upsert', async () => {
    prismaMock.userProfile.upsert.mockResolvedValue(
      userProfileFixtures.johnDoe,
    );

    const updateDto = updateUserProfileFixtures.updateJohnDoe;
    const result = await service.updateProfile(authUserIdFixture, updateDto);

    expect(result).toEqual(userProfileFixtures.johnDoe);
    expect(prismaMock.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId: authUserIdFixture },
      update: updateDto,
      create: {
        ...updateDto,
        userId: authUserIdFixture,
        coreSkills: [],
      },
    });
  });

  it('should hide a section when visibility is false', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue({
      ...userProfileFixtures.johnDoe,
      contactVisibility: false,
    });

    const result = await service.getProfile(authUserIdFixture);

    expect(result.email).toBeNull();
    expect(result.linkedin).toBeNull();
    expect(result.github).toBeNull();
    expect(result.webpage).toBeNull();
    expect(result.name).toBe(userProfileFixtures.johnDoe.name);
  });

  it('should hide all sections when profile is not public', async () => {
    prismaMock.userProfile.findUnique.mockResolvedValue({
      ...userProfileFixtures.johnDoe,
      isPublic: false,
      personalVisibility: true,
      contactVisibility: true,
      skillsVisibility: true,
      preferenceVisibility: true,
    });

    const result = await service.getProfile(authUserIdFixture);

    expect(result.name).toBeNull();
    expect(result.email).toBeNull();
    expect(result.coreSkills).toEqual([]);
    expect(result.experienceLevel).toBeNull();
  });
});
