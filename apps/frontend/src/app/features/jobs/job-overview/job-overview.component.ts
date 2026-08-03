import { Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { marked } from 'marked';
import { translateSignal } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-job-overview',
  imports: [
    HlmButtonImports,
    HlmCardImports,
    HlmIconImports,
    HlmScrollAreaImports,
    HlmTooltipImports,
  ],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './job-overview.component.html',
})
export class JobOverviewComponent {
  private readonly sanitizer = inject(DomSanitizer);

  description = input<string | null | undefined>('');

  readonly edit = output<void>();

  noDescription = translateSignal('jobs.overview.noDescription');
  protected readonly editTooltip = translateSignal('jobs.overview.editTooltip');
  protected readonly renderedDescription = computed(() => {
    const content = this.description();
    if (!content || !content.trim()) {
      return (
        '<p class="text-sm text-muted-foreground">' +
        this.noDescription() +
        '</p>'
      );
    }

    const parsed = marked.parse(content.trim(), {
      gfm: true,
      breaks: true,
    });

    const html = typeof parsed === 'string' ? parsed : '';

    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected onEdit(): void {
    this.edit.emit();
  }
}
