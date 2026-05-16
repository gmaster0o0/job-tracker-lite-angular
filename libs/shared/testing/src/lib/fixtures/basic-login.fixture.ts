export const validLoginCredentials = {
  email: 'admin@example.com',
  password: 'test123',
};

export const invalidLoginCredentials = {
  email: 'wrong@example.com',
  password: 'badpass1',
};

export const invalidLoginCredentialsBadEmail = {
  email: 'invalid-email',
  password: 'test123',
};

export const invalidLoginCredentialsMissingEmail = {
  password: 'test123',
};

export const validUserResponse = {
  id: 'user_123',
  email: 'admin@example.com',
};

export const buildZodIssue = (overrides: Record<string, unknown> = {}) => ({
  code: 'invalid_type',
  path: ['email'],
  message: 'Invalid email',
  params: {
    errorCode: 'invalid_email',
  },
  ...overrides,
});

export const zodIssueInvalidEmail = buildZodIssue({
  path: ['email'],
  params: {
    errorCode: 'invalid_email',
  },
});

export const zodIssueWeakPassword = buildZodIssue({
  path: ['password'],
  params: {
    errorCode: 'weak_password',
  },
});

export const zodIssuePasswordTooShort = buildZodIssue({
  code: 'too_small',
  path: ['password'],
  message: 'Password is too short',
  params: {
    errorCode: 'too_short',
    min: 8,
  },
});
