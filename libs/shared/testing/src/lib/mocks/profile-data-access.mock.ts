import { ResourceState } from './ResourceState';

export type ProfileDataAccessMockOptions = {
  profile?: any;
  isLoading?: boolean;
  error?: unknown;
};

export function createProfileDataAccessMock(
  options: ProfileDataAccessMockOptions = {},
  mockFactory: (fn?: any) => any = (fn) => fn,
) {
  const profile = options.profile ?? null;
  const isLoading = options.isLoading ?? false;

  const profileResource: ResourceState<any> = {
    value: () => profile,
    isLoading: () => isLoading,
    reload: mockFactory(),
    error: () => options.error ?? null,
  };

  return {
    profileResource,
    updateProfile: mockFactory(),
  };
}

export const createProfileServiceMock = (
  mockFactory: (fn?: any) => any = (fn) => fn,
) => ({
  getProfile: mockFactory(),
  updateProfile: mockFactory(),
});
