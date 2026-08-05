import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  AuthSessionService,
  UsersDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { UserListItemDto } from '@job-tracker-lite-angular/schemas';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'app-user-public-profile',
  standalone: true,
  imports: [
    TranslocoModule,
    RouterLink,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmSkeletonImports,
  ],
  template: `
    <div class="container mx-auto max-w-4xl px-4 py-8">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ 'users.profile.title' | transloco }}
        </h1>

        <a hlmBtn variant="outline" routerLink="/users">
          {{ 'common.back' | transloco }}
        </a>
      </div>

      @if (isLoading()) {
        <div class="space-y-4" data-testid="user-profile-loading">
          <hlm-skeleton class="h-8 w-64" />
          <hlm-skeleton class="h-40 w-full" />
        </div>
      } @else if (user(); as user) {
        <hlm-card>
          <div hlmCardHeader class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <h2 hlmCardTitle>
                  {{ user.name }}
                  <span class="text-sm font-normal text-muted-foreground"
                    >(@{{ slug() }})</span
                  >
                </h2>
                <p hlmCardDescription>{{ user.email }}</p>
              </div>

              <div class="flex items-center gap-3">
                <span
                  hlmBadge
                  [class]="roleClasses[user.role]"
                  data-testid="user-role-badge"
                >
                  {{ 'users.roles.' + user.role | transloco }}
                </span>

                @if (canEdit()) {
                  <a
                    hlmBtn
                    variant="default"
                    [routerLink]="['/profile', slug()]"
                    data-testid="edit-profile-button"
                  >
                    {{ 'common.edit' | transloco }}
                  </a>
                }
              </div>
            </div>
          </div>

          <div hlmCardContent class="py-8 text-center text-muted-foreground">
            {{ 'users.profile.publicViewPlaceholder' | transloco }}
          </div>
        </hlm-card>
      } @else {
        <hlm-card>
          <div hlmCardContent class="py-8 text-center text-muted-foreground">
            {{ 'users.profile.notFound' | transloco }}
          </div>
        </hlm-card>
      }
    </div>
  `,
})
export class UserPublicProfileComponent {
  private readonly usersService = inject(UsersDataAccessService);
  private readonly authSession = inject(AuthSessionService);

  slug = input.required<string>();

  protected readonly isLoading = signal(false);
  protected readonly users = signal<UserListItemDto[]>([]);

  protected readonly user = computed(() => {
    const users = this.users();
    if (!users) return null;
    return users.find((u: UserListItemDto) => u.id === this.slug()) ?? null;
  });

  protected readonly roleClasses: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MODERATOR:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    RECRUITER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    USER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  protected readonly canEdit = computed(() => {
    const currentUserId = this.authSession.session()?.user?.id;
    const targetUserId = this.slug();
    const userRole = this.authSession.role();

    // Can edit if: own profile OR admin/moderator
    return (
      currentUserId === targetUserId ||
      userRole === 'ADMIN' ||
      userRole === 'MODERATOR'
    );
  });

  constructor() {
    void this.loadUser();
  }

  private async loadUser(): Promise<void> {
    this.isLoading.set(true);
    try {
      this.users.set(await this.usersService.listUsers());
    } finally {
      this.isLoading.set(false);
    }
  }
}
