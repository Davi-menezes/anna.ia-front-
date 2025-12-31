
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  userService = inject(UserService);

  login() {
    // In a real app, this would involve form validation and an API call.
    // For this UI simulation, we just log the user in.
    this.userService.login();
  }
}
