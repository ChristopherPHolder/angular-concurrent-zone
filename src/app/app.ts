import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RxLet } from '@rx-angular/template/let';
import { AppShellComponent } from './app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  template: `
    <app-shell *rxLet="[]">
      <router-outlet />
    </app-shell>
  `,
  standalone: true,
  imports: [RouterOutlet, AppShellComponent, RxLet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}





