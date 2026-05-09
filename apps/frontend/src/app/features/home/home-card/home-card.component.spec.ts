import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeCardComponent } from './home-card.component';
import { provideRouter } from '@angular/router';
import { HomeCardHarness } from './home-card.harness';

describe('HomeCardComponent', () => {
  let harness: HomeCardHarness;
  let fixture: ComponentFixture<HomeCardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeCardComponent);
    fixture.componentRef.setInput('card', {
      title: 'Test',
      description: 'Test',
      link: '/test',
      iconBgClass: 'bg-blue-100',
    });
    fixture.componentRef.setInput('iconTemplate', null);

    fixture.detectChanges();
    await fixture.whenStable();
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
