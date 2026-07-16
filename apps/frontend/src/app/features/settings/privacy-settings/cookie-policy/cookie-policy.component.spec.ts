import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CookiePolicyHarness } from './cookie-policy.harness';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookiePolicyComponent } from './cookie-policy.component';
import { provideRouter, Router } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('CookiePolicyComponent', () => {
  let fixture: ComponentFixture<CookiePolicyComponent>;
  let harness: CookiePolicyHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiePolicyComponent, getTranslocoModule()],
      providers: [
        provideRouter([{ path: 'cookie-policy', component: class {} }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookiePolicyComponent);
    router = TestBed.inject(Router);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CookiePolicyHarness,
    );
  });

  it('should navigate to cookie-policy when the open button is clicked', async () => {
    await harness.clickOpenButton();
    expect(router.url).toBe('/cookie-policy');
  });

  it('should open the dialog when the open input is true', async () => {
    fixture.componentRef.setInput('open', true);

    expect(await harness.isDialogVisible()).toBe(true);
  });

  it('should close the dialog and emit closed when open input is set to false', async () => {
    fixture.componentRef.setInput('open', true);

    fixture.componentRef.setInput('open', false);

    expect(await harness.isDialogVisible()).toBe(false);
  });
});
