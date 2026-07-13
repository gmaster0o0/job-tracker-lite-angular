import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagementComponent } from './data-management.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('DataManagementComponent', () => {
  let component: DataManagementComponent;
  let fixture: ComponentFixture<DataManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataManagementComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(DataManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
