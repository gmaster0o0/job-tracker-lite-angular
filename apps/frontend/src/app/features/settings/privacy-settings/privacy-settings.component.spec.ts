import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacySettingsComponent } from './privacy-settings.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
describe('PrivacySettingsComponent', () => {
  let component: PrivacySettingsComponent;
  let fixture: ComponentFixture<PrivacySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacySettingsComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacySettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
