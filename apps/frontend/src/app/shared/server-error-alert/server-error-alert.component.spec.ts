import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ServerErrorAlertComponent } from './server-error-alert.component';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { ServerErrorAlertHarness } from './server-error-alert.harness';

@Component({
  standalone: true,
  imports: [ServerErrorAlertComponent],
  template: `
    <app-server-error-alert
      [errorMessage]="errorMessage()"
      [translationPrefix]="translationPrefix"
      [cssClass]="cssClass"
    />
  `,
})
class HostComponent {
  errorMessage = signal<string | null>(null);
  translationPrefix = 'jobs.create';
  cssClass = 'max-w-md';
}

describe('ServerErrorAlertComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
    }).compileComponents();
  });

  it('should not render when errorMessage is null', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.errorMessage.set(null);
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ServerErrorAlertHarness,
    );

    expect(await harness.isVisible()).toBe(false);
  });

  it('should render when errorMessage has a value', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.errorMessage.set('CONFLICT');
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ServerErrorAlertHarness,
    );

    expect(await harness.isVisible()).toBe(true);
  });

  it('should display error title and message', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.errorMessage.set('CONFLICT');
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ServerErrorAlertHarness,
    );

    const title = await harness.getTitle();
    const description = await harness.getDescription();

    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
  });

  it('should apply custom css class', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.cssClass = 'custom-class';
    fixture.componentInstance.errorMessage.set('ERROR');
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector(
      '[class*="custom-class"]',
    );
    expect(element).toBeTruthy();
  });
});
