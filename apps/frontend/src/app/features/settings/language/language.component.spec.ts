import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageComponent } from './language.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('LanguageComponent', () => {
  let component: LanguageComponent;
  let fixture: ComponentFixture<LanguageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
