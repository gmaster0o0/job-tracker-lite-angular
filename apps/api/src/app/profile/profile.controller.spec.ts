import { Test } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import {
  authSessionFixtures,
  userProfileFixtures,
  updateUserProfileFixtures,
  createProfileServiceMock,
} from '@job-tracker-lite-angular/testing';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: any;

  beforeEach(async () => {
    profileService = createProfileServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: profileService,
        },
      ],
    }).compile();

    controller = moduleRef.get(ProfileController);
  });

  it('should get current user profile', async () => {
    profileService.getProfile.mockResolvedValue(userProfileFixtures.johnDoe);

    const result = await controller.getProfile(
      authSessionFixtures.authenticated,
    );
    expect(result).toEqual(userProfileFixtures.johnDoe);
    expect(profileService.getProfile).toHaveBeenCalledWith(
      authSessionFixtures.authenticated.user.id,
    );
  });

  it('should update current user profile', async () => {
    profileService.updateProfile.mockResolvedValue(userProfileFixtures.johnDoe);
    const updateDto = updateUserProfileFixtures.updateJohnDoe;

    const result = await controller.updateProfile(
      authSessionFixtures.authenticated,
      updateDto,
    );
    expect(result).toEqual(userProfileFixtures.johnDoe);
    expect(profileService.updateProfile).toHaveBeenCalledWith(
      authSessionFixtures.authenticated.user.id,
      updateDto,
    );
  });
});
