import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineInputComponent } from './input.component';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { InlineInputHarness } from './input.harness';
import { provideIcons } from '@ng-icons/core';
import { lucideUser } from '@ng-icons/lucide';

describe('InlineInputComponent', () => {
  let component: InlineInputComponent;
  let fixture: ComponentFixture<InlineInputComponent>;
  let harness: InlineInputHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineInputComponent],
      providers: [provideIcons({ lucideUser })],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineInputComponent);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      InlineInputHarness,
    );
    fixture.componentRef.setInput('value', '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show read-only mode by default', async () => {
    expect(await harness.isEditing()).toBeFalsy();
  });

  it('should show placeholder in read-only mode if value and fallbackValue is empty', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');

    expect(await harness.getValue()).toBe('');
    expect(await harness.getPlaceholder()).toBe('Enter text');
  });

  it('should show fallbackValue in read-only mode if value is empty', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    fixture.componentRef.setInput('fallbackValue', 'N/A');

    expect(await harness.getValue()).toBe('N/A');
  });

  it('should show value in editing mode', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('value', 'Hello');

    expect(await harness.getValue()).toBe('Hello');
  });

  it('should trim value changes when autoTrim is true', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('autoTrim', true);

    await harness.setValue('  multiple   spaces  ');

    expect(component.value()).toBe('multiple spaces');
  });

  it('should not trim value changes when autoTrim is false', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('autoTrim', false);

    await harness.setValue('  multiple   spaces  ');

    expect(component.value()).toBe('  multiple   spaces  ');
  });

  it('should show icon when provided', async () => {
    fixture.componentRef.setInput('icon', 'lucideUser');

    expect(await harness.hasIcon()).toBeTruthy();
  });

  it('should display fallback when not editing and value when editing', async () => {
    fixture.componentRef.setInput('value', 'Live value');
    fixture.componentRef.setInput('fallbackValue', 'Read only value');
    fixture.componentRef.setInput('isEditing', false);

    expect(await harness.getValue()).toBe('Read only value');

    fixture.componentRef.setInput('isEditing', true);

    expect(await harness.getValue()).toBe('Live value');
  });

  it('should show placeholder in input field when editing', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('placeholder', 'Enter name');

    expect(await harness.getPlaceholder()).toBe('Enter name');
  });

  it('should allow programmatic updates even when not editing', async () => {
    fixture.componentRef.setInput('isEditing', false);
    await harness.setValue('test');

    expect(component.value()).toBe('test');
  });
});
