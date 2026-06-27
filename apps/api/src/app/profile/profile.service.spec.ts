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
    expect(result).toEqual(userProfileFixtures.empty);
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
});
