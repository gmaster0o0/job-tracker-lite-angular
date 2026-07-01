import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  updateUserProfileSchema,
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { ZodBody } from '@job-tracker-lite-angular/core-utils';
import {
  AuthGuard,
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @AllowAnonymous()
  async getProfile(@Session() session: UserSession): Promise<UserProfileDto> {
    return this.profileService.getProfile(session.user.id);
  }

  @Patch()
  async updateProfile(
    @Session() session: UserSession,
    @ZodBody(updateUserProfileSchema) updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.profileService.updateProfile(session.user.id, updateProfileDto);
  }
}
