import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { UsersDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { UserListItemDto } from '@job-tracker-lite-angular/schemas';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';

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

  protected readonly roleClasses: Record<string, string> = {
    ADMIN: 'bg-primary text-primary-foreground',
    MODERATOR: 'bg-blue-600 text-white',
    RECRUITER: 'bg-emerald-600 text-white',
    USER: 'bg-secondary text-secondary-foreground',
  };
}
