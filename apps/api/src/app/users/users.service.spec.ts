import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { createPrismaServiceMock } from '@job-tracker-lite-angular/testing';
import { UsersService } from './users.service';
import { userListFixtures } from '@job-tracker-lite-angular/testing';
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
      const userId = 'user_basic';
      const dto = { role: Role.MODERATOR };
      const updatedUser = {
        id: userId,
        name: 'Basic User',
        email: 'basic@example.com',
        role: Role.MODERATOR,
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        name: 'Basic User',
        email: 'basic@example.com',
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
});
