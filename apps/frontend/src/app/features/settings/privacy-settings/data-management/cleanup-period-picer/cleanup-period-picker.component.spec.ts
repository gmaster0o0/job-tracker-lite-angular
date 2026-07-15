import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CleanupPeriodPickerComponent } from './cleanup-period-picker.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('CleanupPeriodPickerComponent', () => {
  let component: CleanupPeriodPickerComponent;
  let fixture: ComponentFixture<CleanupPeriodPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CleanupPeriodPickerComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CleanupPeriodPickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
