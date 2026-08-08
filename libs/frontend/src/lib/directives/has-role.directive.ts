import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { AuthSessionService } from '../services/auth-session.service';

@Directive({
  selector: '[libHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly authSession = inject(AuthSessionService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private _allowedRoles: string[] = [];

  // Use effect() as a field initializer to track role changes reactively
  private roleEffect = effect(() => {
    // Access the role signal to establish the dependency
    this.authSession.role();
    this.updateView();
  });

  @Input('libHasRole')
  set allowedRoles(value: string[]) {
    this._allowedRoles = value ?? [];
    this.updateView();
  }

  private updateView(): void {
    const userRole = this.authSession.role();

    if (this._allowedRoles.includes(userRole)) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }

    this.viewContainer.clear();
  }
}
