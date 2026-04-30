import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProgessionStepperComponent } from './progession-stepper.component';

describe('ProgessionStepperComponent', () => {
  const labels = ['Save', 'Applied', 'Interview', 'Offer'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgessionStepperComponent],
    }).compileComponents();
  });

  it('should render completed steps up to current status', () => {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', 2);
    fixture.detectChanges();

    const checks = fixture.debugElement.queryAll(
      By.css('ng-icon[name="lucideCheck"]'),
    );
    expect(checks.length).toBe(3);
  });

  it('should emit selected status when a step is clicked', () => {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', 0);
    fixture.detectChanges();

    const emitted: number[] = [];
    fixture.componentInstance.stepSelected.subscribe((index) =>
      emitted.push(index),
    );

    const stepButtons = fixture.debugElement.queryAll(By.css('button.h-10'));
    stepButtons[1].nativeElement.click();
    fixture.detectChanges();

    expect(emitted).toEqual([1]);
  });

  it('should show rejected styling and no completed checks when rejected', () => {
    const fixture = TestBed.createComponent(ProgessionStepperComponent);
    fixture.componentRef.setInput('labels', labels);
    fixture.componentRef.setInput('activeIndex', -1);
    fixture.componentRef.setInput('errorState', true);
    fixture.detectChanges();

    const checks = fixture.debugElement.queryAll(
      By.css('ng-icon[name="lucideCheck"]'),
    );
    expect(checks.length).toBe(0);

    const firstStep = fixture.debugElement.query(By.css('button.h-10'))
      .nativeElement as HTMLButtonElement;
    expect(firstStep.className).toContain('border-red-500');
  });
});
