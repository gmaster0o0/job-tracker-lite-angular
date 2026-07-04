import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InlineTextareaComponent } from './textarea.component';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { InlineTextareaHarness } from './textarea.harness';
import { provideIcons } from '@ng-icons/core';
import { lucideUser } from '@ng-icons/lucide';
import { longTextFixture } from '@job-tracker-lite-angular/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

describe('InlineTextareaComponent', () => {
  let component: InlineTextareaComponent;
  let fixture: ComponentFixture<InlineTextareaComponent>;
  let harness: InlineTextareaHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineTextareaComponent, getTranslocoModule()],
      providers: [provideIcons({ lucideUser })],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineTextareaComponent);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      InlineTextareaHarness,
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
    fixture.componentRef.setInput('placeholder', 'Enter bio');

    expect(await harness.getValue()).toBe('');
    expect(await harness.getPlaceholder()).toBe('Enter bio');
  });

  it('should show fallbackValue in read-only mode if value is empty', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter bio');
    fixture.componentRef.setInput('fallbackValue', 'N/A');

    expect(await harness.getValue()).toBe('N/A');
  });

  it('should show value in editing mode', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('value', 'Hello');

    expect(await harness.isEditing()).toBeTruthy();
    expect(await harness.getValue()).toBe('Hello');
  });

  it('should trim value changes when autoTrim is true', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('autoTrim', true);
    await harness.setValue('  multiple lines\nwith spaces  ');

    expect(component.value()).toBe('multiple lines with spaces');
  });

  it('should not trim value changes when autoTrim is false', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('autoTrim', false);
    await harness.setValue('  multiple lines\nwith spaces  ');

    expect(component.value()).toBe('  multiple lines\nwith spaces  ');
  });

  it('should show icon when provided', async () => {
    fixture.componentRef.setInput('icon', 'lucideUser');

    expect(await harness.hasIcon()).toBeTruthy();
  });

  it('should correctly report editing state', async () => {
    fixture.componentRef.setInput('isEditing', false);
    expect(await harness.isEditing()).toBe(false);

    fixture.componentRef.setInput('isEditing', true);
    expect(await harness.isEditing()).toBe(true);
  });

  it('should show placeholder in textarea field when editing', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('placeholder', 'Enter bio');

    expect(await harness.getPlaceholder()).toBe('Enter bio');
  });

  it('should allow programmatic updates even when not editing', async () => {
    fixture.componentRef.setInput('isEditing', false);

    await harness.setValue('test');
    expect(component.value()).toBe('test');
  });

  it('should apply maxlength attribute to textarea when provided', async () => {
    fixture.componentRef.setInput('maxLength', '100');

    expect(await harness.getMaxLength()).toBe(100);
  });

  it('should show characters left when maxLength is provided', async () => {
    fixture.componentRef.setInput('maxLength', '100');
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('value', 'ABC');

    const text = await harness.getCharactersLeftText();
    expect(text).toContain('97');
  });

  it('should not show characters left when maxLength is NOT provided', async () => {
    fixture.componentRef.setInput('maxLength', null);

    const text = await harness.getCharactersLeftText();
    expect(text).toBeNull();
  });

  it('should update characters left as value changes', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('maxLength', '10');
    fixture.componentRef.setInput('value', 'soft');

    expect(await harness.getCharactersLeftText()).toContain('6');
    await harness.setValue('software');
    expect(await harness.getCharactersLeftText()).toContain('2');
  });

  it('should handle long text correctly', async () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.componentRef.setInput('maxLength', '600');
    fixture.componentRef.setInput('value', longTextFixture);

    expect(await harness.getCharactersLeftText()).toContain('100');
  });
});
