import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import {
  UpdateUserRoleDto,
  UserListItemDto,
  UserProfileDto,
} from '@job-tracker-lite-angular/schemas';

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
        careerPreference: true,
        skills: {
          include: {
            skill: true,
          },
        },
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

    // Explicitly type userProfile.skills to avoid TypeScript inference issues
    const profileSkills = userProfile.skills as Array<{
      skill: { id: string; name: string };
    }>;

    // Explicitly type careerPreference
    const careerPref = userProfile.careerPreference as {
      experienceLevel:
        'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXPERT' | null;
      workingStyle: 'REMOTE' | 'HYBRID' | 'ON_SITE' | null;
      careerType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | null;
    } | null;

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
      coreSkills: profileSkills.map((us) => us.skill.name),
      experienceLevel: careerPref?.experienceLevel ?? null,
      workingStyle: careerPref?.workingStyle ?? null,
      careerType: careerPref?.careerType ?? null,
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
