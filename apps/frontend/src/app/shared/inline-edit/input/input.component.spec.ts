import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineInputComponent } from './input.component';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { InlineInputHarness } from './input.component.harness';
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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show read-only mode by default', async () => {
    expect(await harness.isEditing()).toBeFalsy();
  });

  it('should show placeholder in read-only mode if value and fallbackValue is empty', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    fixture.detectChanges();

    expect(await harness.getValue()).toBe('Enter text');
  });

  it('should show fallbackValue in read-only mode if value is empty', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    fixture.componentRef.setInput('fallbackValue', 'N/A');
    fixture.detectChanges();

    expect(await harness.getValue()).toBe('N/A');
  });

  it('should show value in editing mode', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('value', 'Hello');
    fixture.detectChanges();

    expect(await harness.isEditing()).toBeTruthy();
    expect(await harness.getValue()).toBe('Hello');
  });

  it('should trim value changes when autoTrim is true', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('autoTrim', true);
    fixture.detectChanges();

    await harness.setValue('  multiple   spaces  ');
    // We need to wait for ngModel and onInputChange
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe('multiple spaces');
  });

  it('should not trim value changes when autoTrim is false', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('autoTrim', false);
    fixture.detectChanges();

    await harness.setValue('  multiple   spaces  ');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe('  multiple   spaces  ');
  });

  it('should show icon when provided', async () => {
    fixture.componentRef.setInput('icon', 'lucideUser');
    fixture.detectChanges();

    expect(await harness.hasIcon()).toBeTruthy();
  });

  it('should correctly report editing state', async () => {
    fixture.componentRef.setInput('isEditing', false);
    fixture.detectChanges();
    expect(await harness.isEditing()).toBe(false);

    fixture.componentRef.setInput('isEditing', true);
    fixture.detectChanges();
    expect(await harness.isEditing()).toBe(true);
  });

  it('should show placeholder in input field when editing', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('placeholder', 'Enter name');
    fixture.detectChanges();

    expect(await harness.getPlaceholder()).toBe('Enter name');
  });

  it('should throw error when trying to set value in read-only mode', async () => {
    fixture.componentRef.setInput('isEditing', false);
    fixture.detectChanges();

    await expect(harness.setValue('test')).rejects.toThrow(
      'Cannot set value while not in editing mode',
    );
  });
});
