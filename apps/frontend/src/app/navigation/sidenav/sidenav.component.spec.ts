import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidenavComponent } from './sidenav.component';
import { SidenavHarness } from './sidenav.harness';

describe('SidenavComponent', () => {
  let harness: SidenavHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SidenavComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavComponent);
    await fixture.whenStable();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SidenavHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
