import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { VerifyEmailComponent } from './verify-email.component';
import { VerifyEmailHarness } from './verify-email.harness';

describe('VerifyEmailComponent', () => {
  it('should show the success message when there is no error', async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(VerifyEmailComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      VerifyEmailHarness,
    );

    expect(await harness.getSuccessText()).toContain(
      'Your verification link has been processed',
    );
  });
});
