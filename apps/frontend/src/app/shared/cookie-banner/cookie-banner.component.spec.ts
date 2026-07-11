import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieBannerComponent } from './cookie-banner.component';
import { CookieBannerHarness } from './cookie-banner.harness';
import { getTranslocoModule } from '../transloco-testing.module';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CookieConsentService } from '../../features/settings/privacy-settings/cookie-managment/cookie-concent.service';

describe('CookieBannerComponent', () => {
  let fixture: ComponentFixture<CookieBannerComponent>;
  let harness: CookieBannerHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieBannerComponent, getTranslocoModule()],
      providers: [
        {
          provide: CookieConsentService,
          useValue: {
            saveConsent: vi.fn(),
            openDetailedSettings: vi.fn(),
            showBanner: vi.fn().mockReturnValue(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieBannerComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CookieBannerHarness,
    );
  });

  it('Should call saveConsent with "accepted" when accept button is clicked', async () => {
    await harness.clickAcceptButton();
    const cookieConsentService = TestBed.inject(CookieConsentService);
    expect(cookieConsentService.saveConsent).toHaveBeenCalledWith('accepted');
  });

  it('Should call saveConsent with "rejected" when decline button is clicked', async () => {
    await harness.clickDeclineButton();
    const cookieConsentService = TestBed.inject(CookieConsentService);
    expect(cookieConsentService.saveConsent).toHaveBeenCalledWith('rejected');
  });

  it('Should call openDetailedSettings when settings button is clicked', async () => {
    await harness.clickSettingsButton();
    const cookieConsentService = TestBed.inject(CookieConsentService);
    expect(cookieConsentService.openDetailedSettings).toHaveBeenCalled();
  });

  it('should disappear after clicking', async () => {
    expect(await harness.host()).toBeDefined();

    await harness.clickAcceptButton();

    const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const banner = await loader.getHarnessOrNull(CookieBannerHarness);

    expect(banner).toBeNull();
  });
});
