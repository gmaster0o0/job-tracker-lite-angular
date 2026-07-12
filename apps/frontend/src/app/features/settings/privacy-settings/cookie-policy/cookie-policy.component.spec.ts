import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookiePolicyComponent } from './cookie-policy.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('CookiePolicyComponent', () => {
  let component: CookiePolicyComponent;
  let fixture: ComponentFixture<CookiePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiePolicyComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CookiePolicyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
