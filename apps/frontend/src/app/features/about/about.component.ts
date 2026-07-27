import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="flex h-full items-center justify-center text-muted-foreground">
      <p class="text-sm">About page coming soon.</p>
    </div>
  `,
})
export class AboutComponent {}
