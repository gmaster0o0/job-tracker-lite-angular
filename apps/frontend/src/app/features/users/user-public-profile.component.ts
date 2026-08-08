import { Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
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
                    >(@{{ userId() }})</span
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
                    [routerLink]="['/profile', userId()]"
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
  private readonly authSession = inject(AuthSessionService);

  userId = input.required<string>();

  // Reacts to userId changes instead of loading once in the constructor -
  // reading a required route-bound input synchronously at construction can
  // race ahead of the router actually populating it.
  private readonly userResource = httpResource<UserListItemDto>(
    () => `/api/users/${this.userId()}`,
  );

  protected readonly isLoading = computed(() => this.userResource.isLoading());
  // resource.value() throws when the resource is in an error state (e.g. a
  // 404) - hasValue() must be checked first.
  protected readonly user = computed(() =>
    this.userResource.hasValue() ? this.userResource.value() : null,
  );

  protected readonly roleClasses: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MODERATOR:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    RECRUITER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    USER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  protected readonly canEdit = computed(() => {
    const currentUserId = this.authSession.session()?.user?.id;
    const targetUserId = this.userId();
    const userRole = this.authSession.role();

    // Can edit if: own profile OR admin/moderator
    return (
      currentUserId === targetUserId ||
      userRole === 'ADMIN' ||
      userRole === 'MODERATOR'
    );
  });
}
