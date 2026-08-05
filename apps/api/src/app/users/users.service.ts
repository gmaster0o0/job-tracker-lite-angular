import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import {
  UpdateUserRoleDto,
  UserListItemDto,
  UserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { UserProfile } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(): Promise<UserListItemDto[]> {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userProfile) throw new NotFoundException('User profile not found');

    return this.mapToUserProfileDto(userProfile);
  }

  /**
   * Maps Prisma UserProfile to UserProfileDto.
   * Centralized mapping ensures consistency and makes updates easier.
   */
  private mapToUserProfileDto(
    userProfile: UserProfile & {
      user: { id: string; name: string; email: string };
    },
  ): UserProfileDto {
    return {
      userId: userProfile.userId,
      name: userProfile.user.name,
      title: userProfile.title,
      city: userProfile.city,
      bio: userProfile.bio,
      email: userProfile.user.email,
      linkedin: userProfile.linkedin,
      github: userProfile.github,
      webpage: userProfile.webpage,
      coreSkills: userProfile.coreSkills ?? [],
      experienceLevel: userProfile.experienceLevel,
      workingStyle: userProfile.workingStyle,
      careerType: userProfile.careerType,
      personalVisibility: userProfile.personalVisibility,
      contactVisibility: userProfile.contactVisibility,
      skillsVisibility: userProfile.skillsVisibility,
      preferenceVisibility: userProfile.preferenceVisibility,
    } satisfies UserProfileDto;
  }

  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<UserListItemDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}
