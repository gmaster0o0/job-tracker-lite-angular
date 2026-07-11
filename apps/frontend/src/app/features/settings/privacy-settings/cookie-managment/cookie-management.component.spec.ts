import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieManagementComponent } from './cookie-management.component';
import { CookieConsentService } from './cookie-concent.service';
import { createCookieConsentServiceMock } from '@job-tracker-lite-angular/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CookieManagementHarness } from './cookie-management.harness';

describe('CookieManagementComponent', () => {
  let component: CookieManagementComponent;
  let fixture: ComponentFixture<CookieManagementComponent>;
  let harness: CookieManagementHarness;
  let cookieConsentServiceMock: ReturnType<
    typeof createCookieConsentServiceMock
  >;

  beforeEach(async () => {
    cookieConsentServiceMock = createCookieConsentServiceMock();
    await TestBed.configureTestingModule({
      imports: [CookieManagementComponent, getTranslocoModule()],
      providers: [
        { provide: CookieConsentService, useValue: cookieConsentServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieManagementComponent);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CookieManagementHarness,
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openDetailedSettings when button is clicked', async () => {
    const spy = vi.spyOn(cookieConsentServiceMock, 'openDetailedSettings');
    await harness.clickOpenSettings();
    expect(spy).toHaveBeenCalled();
  });
});
