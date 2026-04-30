import { Component } from '@angular/core';
import { SidenavComponent } from '../../navigation/sidenav/sidenav.component';
import { RouterOutlet } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [SidenavComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {}
