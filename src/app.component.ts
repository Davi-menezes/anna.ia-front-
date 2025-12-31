
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme.service';
import { CreditsModalComponent } from './components/credits-modal/credits-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
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
