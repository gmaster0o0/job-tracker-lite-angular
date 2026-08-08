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
      select: { id: true, slug: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async getUser(slug: string): Promise<UserListItemDto> {
    const user = await this.prisma.user.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // Unlike getUser() (the public, slug-only lookup), the admin edit surface
  // accepts either identifier so a bookmarked or previously-shared id-based
  // link keeps working after a user's slug changes.
  async getUserProfile(idOrSlug: string): Promise<UserDetailsDto> {
    const userId = await this.resolveUserId(idOrSlug);

    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userProfile) throw new NotFoundException('User profile not found');

    return userDetailsSchema.parse(userProfile);
  }

  private async resolveUserId(idOrSlug: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.id;
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
      select: { id: true, slug: true, name: true, email: true, role: true },
    });
  }

  async updateUserProfile(
    idOrSlug: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserDetailsDto> {
    const userId = await this.resolveUserId(idOrSlug);

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
            role: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return userDetailsSchema.parse(updated);
  }
}
