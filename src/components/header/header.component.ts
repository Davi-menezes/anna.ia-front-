
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { HeaderCreditsModalComponent } from '../header-credits-modal/header-credits-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HeaderCreditsModalComponent]
})
export class HeaderComponent {
  userService = inject(UserService);
  themeService = inject(ThemeService);

  isCreditsModalOpen = signal(false);

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  openCreditsModal() {
    this.isCreditsModalOpen.set(true);
  }

  closeCreditsModal() {
    this.isCreditsModalOpen.set(false);
  }
}
