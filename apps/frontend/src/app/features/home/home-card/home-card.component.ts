import { Component, input, TemplateRef } from '@angular/core';
import { HlmCardImports } from 'spartan/ui/helm';
import { HomeCard } from '../home.component';
import { RouterLink } from '@angular/router';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { NgTemplateOutlet } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-home-card',
  standalone: true,
  providers: [provideIcons({ lucideArrowRight })],
  imports: [HlmCardImports, RouterLink, HlmIconImports, NgTemplateOutlet],
  templateUrl: './home-card.component.html',
})
export class HomeCardComponent {
  card = input.required<HomeCard>();
  iconTemplate = input.required<TemplateRef<any>>();
}
