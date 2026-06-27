import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeVisibility(profile: UserProfileDto): UserProfileDto {
    const sanitizedProfile: UserProfileDto = { ...profile };

    const hidePersonal =
      !profile.isPublic || profile.personalVisibility === false;
    const hideContact =
      !profile.isPublic || profile.contactVisibility === false;
    const hideSkills = !profile.isPublic || profile.skillsVisibility === false;
    const hidePreference =
      !profile.isPublic || profile.preferenceVisibility === false;

    if (hidePersonal) {
      sanitizedProfile.name = null;
      sanitizedProfile.title = null;
      sanitizedProfile.city = null;
      sanitizedProfile.bio = null;
    }

    if (hideContact) {
      sanitizedProfile.email = null;
      sanitizedProfile.linkedin = null;
      sanitizedProfile.github = null;
      sanitizedProfile.webpage = null;
    }

    if (hideSkills) {
      sanitizedProfile.coreSkills = [];
    }

    if (hidePreference) {
      sanitizedProfile.experienceLevel = null;
      sanitizedProfile.workingStyle = null;
      sanitizedProfile.careerType = null;
    }

    return sanitizedProfile;
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const createdProfile = await this.prisma.userProfile.create({
        data: {
          userId,
          coreSkills: [],
        },
      });

      return this.sanitizeVisibility(createdProfile);
    }

    return this.sanitizeVisibility(profile);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: updateProfileDto,
      create: {
        ...updateProfileDto,
        userId,
        coreSkills: updateProfileDto.coreSkills ?? [],
      },
    });

    return this.sanitizeVisibility(profile);
  }
}
