import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import {
  UpdateUserRoleDto,
  UserListItemDto,
  UserDetailsDto,
  userDetailsSchema,
  UpdateUserProfileDto,
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

  async getUser(userId: string): Promise<UserListItemDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getUserProfile(userId: string): Promise<UserDetailsDto> {
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

    return userDetailsSchema.parse(userProfile);
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

  async updateUserProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserDetailsDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.userProfile.upsert({
      where: { userId },
      update: dto,
      create: {
        ...dto,
        userId,
        coreSkills: dto.coreSkills ?? [],
      },
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

    return userDetailsSchema.parse(updated);
  }
}
