import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidenavComponent } from './sidenav.component';
import { SidenavHarness } from './sidenav.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('SidenavComponent', () => {
  let harness: SidenavHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SidenavHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
