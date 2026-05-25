import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { marked } from 'marked';
import { translateSignal } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-job-overview',
  imports: [HlmCardImports, HlmScrollAreaImports],
  templateUrl: './job-overview.component.html',
})
export class JobOverviewComponent {
  private readonly sanitizer = inject(DomSanitizer);

  description = input<string | null | undefined>('');

  noDescription = translateSignal('jobs.overview.noDescription');
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
}
