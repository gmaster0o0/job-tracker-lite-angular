import {
  Component,
  SecurityContext,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { marked } from 'marked';

@Component({
  standalone: true,
  selector: 'app-job-overview',
  imports: [HlmCardImports],
  templateUrl: './job-overview.component.html',
})
export class JobOverviewComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly description = input.required<string>();

  protected readonly renderedDescription = computed(() => {
    const content = this.description().trim();
    if (!content) {
      return '<p class="text-sm text-muted-foreground">No description provided.</p>';
    }

    const parsed = marked.parse(content, {
      gfm: true,
      breaks: true,
    });

    const html = typeof parsed === 'string' ? parsed : '';
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  });
}
