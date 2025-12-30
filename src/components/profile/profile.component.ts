
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ProfileComponent {
  userService = inject(UserService);

  creditPercentage = computed(() => {
    const credits = this.userService.credits();
    const maxCredits = this.userService.maxCredits;
    if (maxCredits === 0) return 0;
    return Math.min((credits / maxCredits) * 100, 100);
  });

  // FIX: Use constructor injection for Router to fix type inference issue.
  constructor(private router: Router) {}

  goToCreditsPage() {
    this.router.navigate(['/credits']);
  }

  logout() {
    this.userService.logout();
  }
}
