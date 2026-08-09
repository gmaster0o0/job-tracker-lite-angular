import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  ROLE_BADGE_CLASSES,
  UsersDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { UserListItemDto } from '@job-tracker-lite-angular/schemas';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoModule,
    HlmTableImports,
    HlmBadgeImports,
    HlmSkeletonImports,
    HlmButtonImports,
    HlmTypographyImports,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private readonly usersDataAccess = inject(UsersDataAccessService);

  protected readonly users = signal<UserListItemDto[]>([]);
  protected readonly isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      this.users.set(await this.usersDataAccess.listUsers());
    } finally {
      this.isLoading.set(false);
    }
  }

  protected readonly ROLE_BADGE_CLASSES = ROLE_BADGE_CLASSES;
}
