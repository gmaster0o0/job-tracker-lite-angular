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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
