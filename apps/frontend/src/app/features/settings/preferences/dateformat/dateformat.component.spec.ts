import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateformatComponent } from './dateformat.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('DateformatComponent', () => {
  let component: DateformatComponent;
  let fixture: ComponentFixture<DateformatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateformatComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(DateformatComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update preferences when a date format is selected', () => {
    component.handleDateFormatChange({
      value: 'YYYY-MM-DD',
      label: 'ÉÉÉÉ-HH-NN',
    });

    expect(component.preferences.dateFormat()).toBe('YYYY-MM-DD');
  });

  it('should ignore a null/undefined selection', () => {
    const before = component.preferences.dateFormat();

    component.handleDateFormatChange(null);

    expect(component.preferences.dateFormat()).toBe(before);
  });
});
