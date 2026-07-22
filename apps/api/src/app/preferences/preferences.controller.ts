import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import {
  updateUserPreferencesSchema,
  UserPreferencesDto,
  UpdateUserPreferencesDto,
  userPreferencesSchema,
} from '@job-tracker-lite-angular/schemas';
import { ZodBody, zodToApiSchema } from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@ApiTags('preferences')
@ApiBearerAuth()
@Controller('preferences')
@UseGuards(AuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get preferences',
    description:
      "Returns the authenticated user's stored preferences, or sensible defaults if none are stored yet.",
  })
  @ApiOkResponse({ schema: zodToApiSchema(userPreferencesSchema) })
  async getPreferences(
    @Session() session: UserSession,
  ): Promise<UserPreferencesDto> {
    return this.preferencesService.getPreferences(session.user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update preferences',
    description:
      'Partially updates theme/language/dateFormat; updatedAt is required and taken as-is from the client for last-write-wins comparison.',
  })
  @ApiBody({
    description: 'Fields to update on the preferences',
    schema: zodToApiSchema(updateUserPreferencesSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(userPreferencesSchema) })
  async updatePreferences(
    @Session() session: UserSession,
    @ZodBody(updateUserPreferencesSchema)
    updatePreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesDto> {
    return this.preferencesService.updatePreferences(
      session.user.id,
      updatePreferencesDto,
    );
  }
}
