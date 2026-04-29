import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'spartan-ui-helm-card',
  imports: [CommonModule],
  template: `
    <section
      class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200"
    >
      <ng-content />
    </section>
  `,
})
export class HelmCardComponent {}
