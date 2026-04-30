import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobsMenuComponent } from './jobs-menu.component';

describe('JobsMenuComponent', () => {
  let component: JobsMenuComponent;
  let fixture: ComponentFixture<JobsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsMenuComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
