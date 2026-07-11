export const cookieConsentServiceMock = {
  showBanner: { set: () => void 0 },
  getConsent: () => ({
    essential: true,
    statistical: false,
    marketing: false,
    preferences: false,
  }),
  openDetailedSettings: () => void 0,
  saveConsent: () => void 0,
};

export function createCookieConsentServiceMock() {
  return { ...cookieConsentServiceMock };
}
