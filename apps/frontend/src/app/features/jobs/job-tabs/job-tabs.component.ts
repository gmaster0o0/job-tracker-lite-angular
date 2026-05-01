import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

export type JobTabItem = {
  label: string;
  value: string;
};

@Component({
  standalone: true,
  selector: 'app-job-tabs',
  imports: [CommonModule, HlmButtonImports],
  templateUrl: './job-tabs.component.html',
})
export class JobTabsComponent {
  readonly tabs = input.required<readonly JobTabItem[]>();
  readonly activeTab = input.required<string>();
  readonly disabled = input(false);

  readonly tabSelected = output<string>();

  protected onSelect(tabValue: string): void {
    if (this.disabled() || this.activeTab() === tabValue) {
      return;
    }

    this.tabSelected.emit(tabValue);
  }
}
