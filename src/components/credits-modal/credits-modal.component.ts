
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credits-modal',
  standalone: true,
  templateUrl: './credits-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CreditsModalComponent {
  userService = inject(UserService);

  constructor(private router: Router) {}

  closeModal() {
    this.userService.closeOutOfCreditsModal();
  }

  goToCreditsPage() {
    this.router.navigate(['/credits']);
    this.closeModal();
  }
}
