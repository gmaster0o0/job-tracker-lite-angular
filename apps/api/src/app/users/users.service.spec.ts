import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { createPrismaServiceMock } from '@job-tracker-lite-angular/testing';
import { UsersService } from './users.service';
import {
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
        select: { id: true, name: true, email: true, role: true },
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
        select: { id: true, name: true, email: true, role: true },
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
    it('should return a user by id', async () => {
      const userId = userFixtures.basic.id;
      const mockUser = {
        id: userId,
        name: userFixtures.basic.name,
        email: userFixtures.basic.email,
        role: Role.USER,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUser(userId);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return a user profile with mapped data', async () => {
      const userId = userFixtures.basic.id;
      const mockUserProfile = {
        userId,
        title: 'Senior Developer',
        city: 'New York',
        bio: 'Experienced developer',
        linkedin: 'linkedin.com/in/user',
        github: 'github.com/user',
        webpage: 'user.dev',
        coreSkills: ['TypeScript', 'Angular'],
        experienceLevel: 'SENIOR',
        workingStyle: 'REMOTE',
        careerType: 'FULL_TIME',
        personalVisibility: 2,
        contactVisibility: 1,
        skillsVisibility: 2,
        preferenceVisibility: 2,
        user: {
          id: userId,
          name: userFixtures.basic.name,
          email: userFixtures.basic.email,
        },
      };

      prismaMock.userProfile.findUnique.mockResolvedValue(mockUserProfile);

      const result = await service.getUserProfile(userId);

      expect(result).toEqual({
        userId,
        name: userFixtures.basic.name,
        title: 'Senior Developer',
        city: 'New York',
        bio: 'Experienced developer',
        email: userFixtures.basic.email,
        linkedin: 'linkedin.com/in/user',
        github: 'github.com/user',
        webpage: 'user.dev',
        coreSkills: ['TypeScript', 'Angular'],
        experienceLevel: 'SENIOR',
        workingStyle: 'REMOTE',
        careerType: 'FULL_TIME',
        personalVisibility: 2,
        contactVisibility: 1,
        skillsVisibility: 2,
        preferenceVisibility: 2,
      });
      expect(prismaMock.userProfile.findUnique).toHaveBeenCalledWith({
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
    });

    it('should throw NotFoundException when user profile does not exist', async () => {
      prismaMock.userProfile.findUnique.mockResolvedValue(null);

      await expect(service.getUserProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update a user profile and return mapped data', async () => {
      const userId = userFixtures.basic.id;
      const updateDto = {
        title: 'Lead Developer',
        bio: 'Updated bio',
        coreSkills: ['TypeScript', 'React', 'Node.js'],
      };
      const mockUser = {
        id: userId,
        name: userFixtures.basic.name,
        email: userFixtures.basic.email,
        role: Role.USER,
      };
      const mockUpdatedProfile = {
        userId,
        title: 'Lead Developer',
        city: 'New York',
        bio: 'Updated bio',
        linkedin: null,
        github: null,
        webpage: null,
        coreSkills: ['TypeScript', 'React', 'Node.js'],
        experienceLevel: 'SENIOR',
        workingStyle: 'REMOTE',
        careerType: 'FULL_TIME',
        personalVisibility: 2,
        contactVisibility: 1,
        skillsVisibility: 2,
        preferenceVisibility: 2,
        user: {
          id: userId,
          name: userFixtures.basic.name,
          email: userFixtures.basic.email,
        },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.userProfile.upsert.mockResolvedValue(mockUpdatedProfile);

      const result = await service.updateUserProfile(userId, updateDto);

      expect(result.title).toBe('Lead Developer');
      expect(result.bio).toBe('Updated bio');
      expect(result.coreSkills).toEqual(['TypeScript', 'React', 'Node.js']);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
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
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserProfile('nonexistent-id', { title: 'Developer' }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.userProfile.upsert).not.toHaveBeenCalled();
    });

    it('should write to the correct target user profile, not the caller', async () => {
      // This test specifically addresses the data integrity bug where
      // moderators editing another user's profile would corrupt their own
      const targetUserId = 'target-user-id';
      const updateDto = { bio: 'New bio for target user' };
      const mockUser = {
        id: targetUserId,
        name: 'Target User',
        email: 'target@example.com',
        role: Role.USER,
      };
      const mockProfile = {
        userId: targetUserId,
        bio: 'New bio for target user',
        title: null,
        city: null,
        linkedin: null,
        github: null,
        webpage: null,
        coreSkills: [],
        experienceLevel: null,
        workingStyle: null,
        careerType: null,
        personalVisibility: 0,
        contactVisibility: 0,
        skillsVisibility: 0,
        preferenceVisibility: 0,
        user: {
          id: targetUserId,
          name: 'Target User',
          email: 'target@example.com',
        },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.userProfile.upsert.mockResolvedValue(mockProfile);

      const result = await service.updateUserProfile(targetUserId, updateDto);

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
