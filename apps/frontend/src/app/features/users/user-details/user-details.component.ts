import {
  Component,
  computed,
  debounced,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  UserDetailsDto,
} from '@job-tracker-lite-angular/schemas';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HasRoleDirective } from '@job-tracker-lite-angular/frontend-data-access';
import { ProfileComponent } from '../../profile/profile.component';

type UserRole = UserDetailsDto['role'];

interface RoleOption {
  readonly value: UserRole;
  readonly label: () => string;
}

const SAVE_DEBOUNCE_MS = 1000;

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    TranslocoModule,
    HlmSelectImports,
    HlmSkeletonImports,
    HasRoleDirective,
    ProfileComponent,
  ],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersDataAccess = inject(UsersDataAccessService);
  private readonly notification = inject(NotificationService);
  private readonly authSession = inject(AuthSessionService);
  private readonly transloco = inject(TranslocoService);

  // The route accepts either the user's id or slug - `getUserProfile`
  // resolves either, and the id is the canonical form: once loaded, a
  // slug-based URL is replaced with the id-based one.
  protected readonly selectedUserId = signal<string | null>(
    this.route.snapshot.paramMap.get('slug'),
  );
  protected readonly isLoading = signal(true);
  protected readonly user = signal<UserDetailsDto | null>(null);

  protected readonly roleOptions: readonly RoleOption[] = [
    { value: 'ADMIN', label: translateSignal('users.roles.ADMIN') },
    { value: 'MODERATOR', label: translateSignal('users.roles.MODERATOR') },
    { value: 'RECRUITER', label: translateSignal('users.roles.RECRUITER') },
    { value: 'USER', label: translateSignal('users.roles.USER') },
  ];

  protected readonly currentRoleValue = computed(
    () =>
      this.roleOptions.find((option) => option.value === this.user()?.role) ??
      null,
  );

  protected readonly roleItemToString = (option: RoleOption | null): string =>
    option?.label() ?? '';

  // Auto-save with debouncer for role changes
  private readonly roleChangeRequests = signal(0);
  private readonly settledRoleChangeRequests = debounced(
    this.roleChangeRequests,
    SAVE_DEBOUNCE_MS,
  );
  private readonly pendingRoleChange = signal<UserRole | null>(null);

  constructor() {
    void this.loadData();

    // Effect to handle debounced role changes
    effect(() => {
      if (this.settledRoleChangeRequests.value() === 0) {
        return;
      }
      untracked(() => void this.saveRoleChange());
    });
  }

  protected onRoleChange(option: RoleOption | null | undefined): void {
    const currentUser = this.user();

    if (!option || !currentUser || option.value === currentUser.role) {
      return;
    }

    this.pendingRoleChange.set(option.value);
    this.roleChangeRequests.update((count) => count + 1);
  }

  private async saveRoleChange(): Promise<void> {
    const currentUser = this.user();
    const newRole = this.pendingRoleChange();

    if (!newRole || !currentUser) {
      return;
    }

    try {
      const updated = await this.usersDataAccess.updateUserRole(
        currentUser.id,
        {
          role: newRole,
        } satisfies UpdateUserRoleDto,
      );

      this.user.update((current) =>
        current ? { ...current, role: updated.role } : current,
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
      this.pendingRoleChange.set(null);
    }
  }

  private async loadData(): Promise<void> {
    try {
      const requestedId = this.selectedUserId() ?? '';
      const user = await this.usersDataAccess.getUserProfile(requestedId);
      this.user.set(user);

      if (user.id !== requestedId) {
        this.selectedUserId.set(user.id);
        void this.router.navigate(['/profile', user.id], {
          replaceUrl: true,
        });
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
