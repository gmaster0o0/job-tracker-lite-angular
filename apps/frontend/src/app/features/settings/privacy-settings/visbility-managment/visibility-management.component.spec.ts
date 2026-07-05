import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisibilityManagementComponent } from './visibility-management.component';

describe('VisibilityManagementComponent', () => {
  let component: VisibilityManagementComponent;
  let fixture: ComponentFixture<VisibilityManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisibilityManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisibilityManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
