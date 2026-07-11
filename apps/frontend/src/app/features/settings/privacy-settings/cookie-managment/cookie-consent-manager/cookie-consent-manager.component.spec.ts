import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieConsentManager } from './cookie-consent-manager.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('CookieConsentManager', () => {
  let component: CookieConsentManager;
  let fixture: ComponentFixture<CookieConsentManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieConsentManager, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
