import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { AuthSessionService } from '../services/auth-session.service';

@Directive({
  selector: '[libHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private _allowedRoles: string[] = [];

  @Input('libHasRole')
  set allowedRoles(value: string[]) {
    this._allowedRoles = value ?? [];
    this.updateView();
  }

  ngOnInit(): void {
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
