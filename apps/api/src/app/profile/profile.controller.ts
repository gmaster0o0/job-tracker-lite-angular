import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
  updateUserProfileSchema,
  UserProfileDto,
  UpdateUserProfileDto,
  userProfileSchema,
} from '@job-tracker-lite-angular/schemas';
import { ZodBody, zodToApiSchema } from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Get the public profile',
    description:
      "Returns the authenticated user's profile, respecting per-section visibility settings.",
  })
  @ApiOkResponse({ schema: zodToApiSchema(userProfileSchema) })
  async getProfile(@Session() session: UserSession): Promise<UserProfileDto> {
    return this.profileService.getProfile(session.user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the profile',
    description:
      "Partially updates the fields of the authenticated user's profile.",
  })
  @ApiBody({
    description: 'Fields to update on the profile',
    schema: zodToApiSchema(updateUserProfileSchema),
  })
  @ApiOkResponse({ schema: zodToApiSchema(userProfileSchema) })
  async updateProfile(
    @Session() session: UserSession,
    @ZodBody(updateUserProfileSchema) updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.profileService.updateProfile(session.user.id, updateProfileDto);
  }
}
