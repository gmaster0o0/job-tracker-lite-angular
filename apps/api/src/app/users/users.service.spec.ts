import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { createPrismaServiceMock } from '@job-tracker-lite-angular/testing';
import { UsersService } from './users.service';
import {
  prismaUserProfileWithUserFixtures,
  userFixtures,
  userListFixtures,
} from '@job-tracker-lite-angular/testing';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('listUsers', () => {
    it('should return a list of users ordered by name', async () => {
      prismaMock.user.findMany.mockResolvedValue(userListFixtures);

      const result = await service.listUsers();

      expect(result).toEqual(userListFixtures);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          slug: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should return an empty array when no users exist', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await service.listUsers();

      expect(result).toEqual([]);
    });
  });

  describe('updateUserRole', () => {
    it('should update the role of an existing user', async () => {
      const userId = userFixtures.basic.id;
      const dto = { role: Role.MODERATOR };
      const updatedUser = {
        id: userId,
        slug: userFixtures.basic.slug,
        name: userFixtures.basic.name,
        email: userFixtures.basic.email,
        role: Role.MODERATOR,
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        name: userFixtures.basic.name,
        email: userFixtures.basic.email,
        role: Role.USER,
      });
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, dto);

      expect(result).toEqual(updatedUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: Role.MODERATOR },
        select: {
          id: true,
          slug: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserRole('nonexistent-id', { role: Role.ADMIN }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return a user by slug', async () => {
      const slug = userFixtures.basic.slug;
      const mockUser = userListFixtures.find((user) => user.slug === slug);

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUser(slug);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { slug },
        select: {
          id: true,
          slug: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });

    it('should throw NotFoundException when no user has that slug', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser('nonexistent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not fall back to id - a raw id is not a valid slug lookup', async () => {
      // getUser is the public route; only getUserProfile/updateUserProfile
      // accept either identifier.
      prismaMock.user.findUnique.mockResolvedValue(null);

      await service.getUser(userFixtures.basic.id).catch(() => undefined);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { slug: userFixtures.basic.id },
        select: expect.anything(),
      });
    });
  });

  describe('getUserProfile', () => {
    function mockProfileResolution() {
      const mockUserProfile = prismaUserProfileWithUserFixtures.basic;
      const { user, ...profile } = mockUserProfile;

      prismaMock.user.findFirst.mockResolvedValue({ id: user.id });
      prismaMock.userProfile.findUnique.mockResolvedValue(mockUserProfile);

      return { ...profile, ...user };
    }

    it('should resolve the target by slug and return the profile', async () => {
      const slug = userFixtures.basic.slug;
      const userId = userFixtures.basic.id;
      const expected = mockProfileResolution();

      const result = await service.getUserProfile(slug);

      expect(result).toEqual(expected);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ id: slug }, { slug }] },
        select: { id: true },
      });
      expect(prismaMock.userProfile.findUnique).toHaveBeenCalledWith({
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
    });

    it('should also resolve the target when given the raw id', async () => {
      const userId = userFixtures.basic.id;
      const expected = mockProfileResolution();

      const result = await service.getUserProfile(userId);

      expect(result).toEqual(expected);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ id: userId }, { slug: userId }] },
        select: { id: true },
      });
    });

    it('should throw NotFoundException when no user matches the id or slug', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(service.getUserProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.userProfile.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the user exists but has no profile', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: userFixtures.basic.id,
      });
      prismaMock.userProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.getUserProfile(userFixtures.basic.slug),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserProfile', () => {
    it('should resolve the target by slug and update the profile', async () => {
      const slug = userFixtures.basic.slug;
      const userId = userFixtures.basic.id;
      const updateDto = {
        title: 'Lead Developer',
        bio: 'Updated bio',
        coreSkills: ['TypeScript', 'React', 'Node.js'],
      };
      const mockUpdatedProfile = {
        ...prismaUserProfileWithUserFixtures.basic,
        title: 'Lead Developer',
        bio: 'Updated bio',
        coreSkills: ['TypeScript', 'React', 'Node.js'],
      };

      prismaMock.user.findFirst.mockResolvedValue({ id: userId });
      prismaMock.userProfile.upsert.mockResolvedValue(mockUpdatedProfile);

      const result = await service.updateUserProfile(slug, updateDto);

      expect(result.title).toBe('Lead Developer');
      expect(result.bio).toBe('Updated bio');
      expect(result.coreSkills).toEqual(['TypeScript', 'React', 'Node.js']);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ id: slug }, { slug }] },
        select: { id: true },
      });
      expect(prismaMock.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: updateDto,
        create: {
          ...updateDto,
          userId,
          coreSkills: updateDto.coreSkills,
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
    });

    it('should throw NotFoundException when no user matches the id or slug', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.updateUserProfile('nonexistent', { title: 'Developer' }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.userProfile.upsert).not.toHaveBeenCalled();
    });

    it('should write to the correct target user profile, not the caller', async () => {
      // This test specifically addresses the data integrity bug where
      // moderators editing another user's profile would corrupt their own
      const targetSlug = userFixtures.moderator.slug;
      const targetUserId = userFixtures.moderator.id;
      const updateDto = { bio: 'New bio for target user' };
      const mockProfile = {
        ...prismaUserProfileWithUserFixtures.moderator,
        bio: 'New bio for target user',
      };

      prismaMock.user.findFirst.mockResolvedValue({ id: targetUserId });
      prismaMock.userProfile.upsert.mockResolvedValue(mockProfile);

      const result = await service.updateUserProfile(targetSlug, updateDto);

      // Assert that the update targeted the correct user
      expect(prismaMock.userProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: targetUserId },
          create: expect.objectContaining({ userId: targetUserId }),
        }),
      );
      expect(result.userId).toBe(targetUserId);
      expect(result.bio).toBe('New bio for target user');
    });
  });
});
