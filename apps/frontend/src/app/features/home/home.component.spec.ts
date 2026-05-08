import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HomeHarness } from './home.harness';

describe('HomeComponent', () => {
  let harness: HomeHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      HomeHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
