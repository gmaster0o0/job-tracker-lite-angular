import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import {
  UserProfileDto,
  UpdateUserProfileDto,
  userProfileSchema,
} from '@job-tracker-lite-angular/schemas';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const created = await this.prisma.userProfile.create({
        data: {
          userId,
          coreSkills: [],
        },
      });

      return userProfileSchema.parse(created);
    }

    return userProfileSchema.parse(profile);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const updated = await this.prisma.userProfile.upsert({
      where: { userId },
      update: updateProfileDto,
      create: {
        ...updateProfileDto,
        userId,
        coreSkills: updateProfileDto.coreSkills ?? [],
      },
    });

    return userProfileSchema.parse(updated);
  }
}
