
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CreditsModalComponent } from './components/credits-modal/credits-modal.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, CreditsModalComponent]
})
export class AppComponent {
  // Inject ThemeService to initialize it and apply the theme.
  constructor() {
    inject(ThemeService);
  }
}
