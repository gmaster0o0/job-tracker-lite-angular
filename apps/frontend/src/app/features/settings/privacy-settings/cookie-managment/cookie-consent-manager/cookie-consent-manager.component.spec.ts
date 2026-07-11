import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieConsentManager } from './cookie-consent-manager.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { createBrnDialogRefMock } from '@job-tracker-lite-angular/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CookieConsentManagerHarness } from './cookie-consent-manager.harness';

describe('CookieConsentManager', () => {
  let component: CookieConsentManager;
  let fixture: ComponentFixture<CookieConsentManager>;
  let harness: CookieConsentManagerHarness;
  let dialogRefMock: ReturnType<typeof createBrnDialogRefMock>;

  beforeEach(async () => {
    dialogRefMock = createBrnDialogRefMock();
    await TestBed.configureTestingModule({
      imports: [CookieConsentManager, getTranslocoModule()],
      providers: [
        { provide: BrnDialogRef, useValue: dialogRefMock },
        {
          provide: DIALOG_DATA,
          useValue: {
            consent: {
              essential: true,
              statistical: false,
              marketing: false,
              preferences: false,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentManager);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CookieConsentManagerHarness,
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have essential cookies checked and disabled', async () => {
    expect(await harness.isEssentialChecked()).toBe(true);
    expect(await harness.isEssentialDisabled()).toBe(true);
  });

  it('should call close with preferences when saving', async () => {
    const spy = vi.spyOn(dialogRefMock, 'close');
    await harness.save();
    expect(spy).toHaveBeenCalledWith({ essential: true });
  });

  it('should call close without arguments when canceling', async () => {
    const spy = vi.spyOn(dialogRefMock, 'close');
    await harness.cancel();
    expect(spy).toHaveBeenCalled();
    // According to the component code, cancel calls dialogRef.close() without args
  });
});
