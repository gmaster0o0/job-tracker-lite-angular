import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TranslocoModule,
  TranslocoService,
  translateSignal,
} from '@jsverse/transloco';
import {
  AuthSessionService,
  NotificationService,
  UsersDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  UpdateUserRoleDto,
  UserListItemDto,
} from '@job-tracker-lite-angular/schemas';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HasRoleDirective } from '@job-tracker-lite-angular/frontend-data-access';

type UserRole = UserListItemDto['role'];

interface RoleOption {
  readonly value: UserRole;
  readonly label: () => string;
}

@Component({
  selector: 'app-user-profile-shell',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmSkeletonImports,
    HasRoleDirective,
  ],
  templateUrl: './user-profile-shell.component.html',
})
export class UserProfileShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly usersDataAccess = inject(UsersDataAccessService);
  private readonly notification = inject(NotificationService);
  private readonly authSession = inject(AuthSessionService);
  private readonly transloco = inject(TranslocoService);

  protected readonly isLoading = signal(true);
  protected readonly isSavingRole = signal(false);
  protected readonly selectedUserId = signal<string | null>(
    this.route.snapshot.paramMap.get('slug'),
  );
  protected readonly users = signal<UserListItemDto[]>([]);

  protected readonly roleOptions: readonly RoleOption[] = [
    { value: 'ADMIN', label: translateSignal('users.roles.ADMIN') },
    { value: 'MODERATOR', label: translateSignal('users.roles.MODERATOR') },
    { value: 'RECRUITER', label: translateSignal('users.roles.RECRUITER') },
    { value: 'USER', label: translateSignal('users.roles.USER') },
  ];

  protected readonly user = computed(
    () =>
      this.users().find((item) => item.id === this.selectedUserId()) ?? null,
  );

  protected readonly currentRoleValue = computed(
    () =>
      this.roleOptions.find((option) => option.value === this.user()?.role) ??
      null,
  );

  protected readonly roleClasses: Record<UserRole, string> = {
    ADMIN: 'bg-primary text-primary-foreground',
    MODERATOR: 'bg-blue-600 text-white',
    RECRUITER: 'bg-emerald-600 text-white',
    USER: 'bg-secondary text-secondary-foreground',
  };

  protected readonly roleItemToString = (option: RoleOption | null): string =>
    option?.label() ?? '';

  constructor() {
    void this.loadUser();
  }

  protected async onRoleChange(
    option: RoleOption | null | undefined,
  ): Promise<void> {
    const currentUser = this.user();

    if (!option || !currentUser || option.value === currentUser.role) {
      return;
    }

    this.isSavingRole.set(true);

    try {
      const updated = await this.usersDataAccess.updateUserRole(
        currentUser.id,
        {
          role: option.value,
        } satisfies UpdateUserRoleDto,
      );

      this.users.update((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );

      const session = this.authSession.session();
      if (session?.user.id === updated.id) {
        this.authSession.setSession({
          ...session,
          user: {
            ...session.user,
            role: updated.role,
          },
        });
      }

      this.notification.success(
        this.transloco.translate('users.profile.roleUpdated'),
      );
    } catch {
      this.notification.error(
        this.transloco.translate('users.profile.roleUpdateFailed'),
      );
    } finally {
      this.isSavingRole.set(false);
    }
  }

  private async loadUser(): Promise<void> {
    try {
      this.users.set(await this.usersDataAccess.listUsers());
    } finally {
      this.isLoading.set(false);
    }
  }
}
