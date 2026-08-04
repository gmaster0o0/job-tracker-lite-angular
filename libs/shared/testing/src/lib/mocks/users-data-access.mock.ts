import { userListFixtures } from '../fixtures/auth.fixtures';

export function createUsersDataAccessMock(mockFactory: () => any) {
  const listUsers = mockFactory();
  const updateUserRole = mockFactory();

  if (typeof listUsers.mockImplementation === 'function') {
    listUsers.mockImplementation(async () => userListFixtures);
  }

  if (typeof updateUserRole.mockImplementation === 'function') {
    updateUserRole.mockImplementation(async (id: string, dto: any) => ({
      ...userListFixtures.find((u) => u.id === id),
      role: dto.role,
    }));
  }

  return { listUsers, updateUserRole, __fixtures: { users: userListFixtures } };
}
