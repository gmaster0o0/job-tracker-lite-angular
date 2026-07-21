export type UserPreferencesServiceMockOptions = {
  init?: () => Promise<void>;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  dateFormat?: string;
};

export function createUserPreferencesServiceMock(
  mockFactory: () => any,
  options: UserPreferencesServiceMockOptions = {},
) {
  let currentTheme = options.theme ?? 'light';
  let currentLanguage = options.language ?? 'hu';
  let currentDateFormat = options.dateFormat ?? 'DD-MM-YYYY';

  const init = options.init ?? mockFactory();
  const theme = mockFactory();
  const language = mockFactory();
  const dateFormat = mockFactory();
  const setTheme = mockFactory();
  const setLanguage = mockFactory();
  const setDateFormat = mockFactory();

  if (!options.init && typeof init.mockImplementation === 'function') {
    init.mockImplementation(async () => undefined);
  }

  if (typeof theme.mockImplementation === 'function') {
    theme.mockImplementation(() => currentTheme);
  }

  if (typeof language.mockImplementation === 'function') {
    language.mockImplementation(() => currentLanguage);
  }

  if (typeof dateFormat.mockImplementation === 'function') {
    dateFormat.mockImplementation(() => currentDateFormat);
  }

  if (typeof setTheme.mockImplementation === 'function') {
    setTheme.mockImplementation((value: 'light' | 'dark' | 'system') => {
      currentTheme = value;
    });
  }

  if (typeof setLanguage.mockImplementation === 'function') {
    setLanguage.mockImplementation((value: string) => {
      currentLanguage = value;
    });
  }

  if (typeof setDateFormat.mockImplementation === 'function') {
    setDateFormat.mockImplementation((value: string) => {
      currentDateFormat = value;
    });
  }

  return {
    init,
    theme,
    language,
    dateFormat,
    setTheme,
    setLanguage,
    setDateFormat,
  };
}
