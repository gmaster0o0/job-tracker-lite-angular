import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LanguageComponent } from './language.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('LanguageComponent', () => {
  let component: LanguageComponent;
  let fixture: ComponentFixture<LanguageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageComponent, getTranslocoModule()],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update preferences when a language is selected', () => {
    component.handleLangChange({ value: 'en', label: () => 'English/EN' });

    expect(component.preferences.language()).toBe('en');
  });

  it('should update preferences when the system option is selected', () => {
    component.handleLangChange({ value: 'system', label: () => 'System' });

    expect(component.preferences.language()).toBe('system');
  });

  it('should ignore a null/undefined selection', () => {
    const before = component.preferences.language();

    component.handleLangChange(null);

    expect(component.preferences.language()).toBe(before);
  });
});
