import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return this.prisma.userProfile.create({
        data: {
          userId,
          coreSkills: [],
        },
      });
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: updateProfileDto,
      create: {
        ...updateProfileDto,
        userId,
        coreSkills: updateProfileDto.coreSkills ?? [],
      },
    });
  }
}
