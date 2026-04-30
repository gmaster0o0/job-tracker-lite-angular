import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JobTabsComponent, JobTabItem } from './job-tabs.component';

describe('JobTabsComponent', () => {
  const tabs: readonly JobTabItem[] = [
    { label: 'Overview', value: 'overview' },
    { label: 'Contacts', value: 'contacts' },
    { label: 'Notes', value: 'notes' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobTabsComponent],
    }).compileComponents();
  });

  it('should render all provided tabs', () => {
    const fixture = TestBed.createComponent(JobTabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('activeTab', 'overview');
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(3);
    expect(buttons[0].nativeElement.textContent).toContain('Overview');
    expect(buttons[1].nativeElement.textContent).toContain('Contacts');
    expect(buttons[2].nativeElement.textContent).toContain('Notes');
  });

  it('should emit selected tab when clicking a non-active tab', () => {
    const fixture = TestBed.createComponent(JobTabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('activeTab', 'overview');
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.tabSelected.subscribe((value) =>
      emitted.push(value),
    );

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[1].nativeElement.click();

    expect(emitted).toEqual(['contacts']);
  });

  it('should not emit when clicking the active tab', () => {
    const fixture = TestBed.createComponent(JobTabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('activeTab', 'overview');
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.tabSelected.subscribe((value) =>
      emitted.push(value),
    );

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[0].nativeElement.click();

    expect(emitted).toEqual([]);
  });

  it('should not emit when component is disabled', () => {
    const fixture = TestBed.createComponent(JobTabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    fixture.componentRef.setInput('activeTab', 'overview');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.tabSelected.subscribe((value) =>
      emitted.push(value),
    );

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons[1].nativeElement.click();

    expect(emitted).toEqual([]);
  });
});
