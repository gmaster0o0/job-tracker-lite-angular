import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { PrivacyPolicyHarness } from './privacy-policy.harness';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { provideRouter, Router } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('PrivacyPolicyComponent', () => {
  let fixture: ComponentFixture<PrivacyPolicyComponent>;
  let harness: PrivacyPolicyHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyComponent, getTranslocoModule()],
      providers: [
        provideRouter([{ path: 'privacy-policy', component: class {} }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    router = TestBed.inject(Router);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      PrivacyPolicyHarness,
    );
    fixture.detectChanges();
  });

  it('should navigate to privacy-policy when the open button is clicked', async () => {
    await harness.clickOpenButton();
    expect(router.url).toBe('/privacy-policy');
  });

  it('should open the dialog when the open input is true', async () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(await harness.isDialogVisible()).toBe(true);
  });

  it('should close the dialog and emit closed when open input is set to false', async () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(await harness.isDialogVisible()).toBe(false);
  });
});
