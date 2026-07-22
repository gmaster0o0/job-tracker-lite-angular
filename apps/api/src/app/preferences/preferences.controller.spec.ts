import { Test } from '@nestjs/testing';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';
import {
  authSessionFixtures,
  userPreferencesFixtures,
  updateUserPreferencesFixtures,
  createPreferencesServiceMock,
} from '@job-tracker-lite-angular/testing';

describe('PreferencesController', () => {
  let controller: PreferencesController;
  let preferencesService: any;

  beforeEach(async () => {
    preferencesService = createPreferencesServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      controllers: [PreferencesController],
      providers: [
        {
          provide: PreferencesService,
          useValue: preferencesService,
        },
      ],
    }).compile();

    controller = moduleRef.get(PreferencesController);
  });

  it('should get current user preferences', async () => {
    preferencesService.getPreferences.mockResolvedValue(
      userPreferencesFixtures.johnDoe,
    );

    const result = await controller.getPreferences(
      authSessionFixtures.authenticated,
    );
    expect(result).toEqual(userPreferencesFixtures.johnDoe);
    expect(preferencesService.getPreferences).toHaveBeenCalledWith(
      authSessionFixtures.authenticated.user.id,
    );
  });

  it('should update current user preferences', async () => {
    preferencesService.updatePreferences.mockResolvedValue(
      userPreferencesFixtures.johnDoe,
    );
    const updateDto = updateUserPreferencesFixtures.updateTheme;

    const result = await controller.updatePreferences(
      authSessionFixtures.authenticated,
      updateDto,
    );
    expect(result).toEqual(userPreferencesFixtures.johnDoe);
    expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
      authSessionFixtures.authenticated.user.id,
      updateDto,
    );
  });
});
