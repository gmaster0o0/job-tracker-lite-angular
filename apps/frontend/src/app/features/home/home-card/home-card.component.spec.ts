import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeCardComponent } from './home-card.component';
import { provideRouter } from '@angular/router';
import { HomeCardHarness } from './home-card.harness';

describe('HomeCardComponent', () => {
  let harness: HomeCardHarness;
  let fixture: ComponentFixture<unknown>;
  beforeEach(async () => {
    @Component({
      template: `
        <app-home-card [card]="card" [iconTemplate]="iconTpl"></app-home-card>
        <ng-template #iconTpl><span>ICON</span></ng-template>
      `,
      standalone: true,
      imports: [HomeCardComponent],
    })
    class TestHostComponent {
      card = {
        title: () => 'Test',
        description: () => 'Test',
        link: '/test',
        iconName: 'test',
        iconBgClass: 'bg-blue-100',
      };
    }

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      HomeCardHarness,
    );
  });

  it('should render the correct card data and link', async () => {
    expect(await harness.getTitle()).toBe('Test');
    expect(await harness.getDescription()).toBe('Test');
    expect(await harness.getCardLink()).toBe('/test');
    expect(await harness.getIconBackgroundClass()).toContain('bg-blue-100');
  });

  it('should apply the correct background class to the icon wrapper', async () => {
    const bgClass = await harness.getIconBackgroundClass();
    expect(bgClass).toContain('bg-blue-100');
  });
});
