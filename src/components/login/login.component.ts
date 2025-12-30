
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class LoginComponent {
  userService = inject(UserService);

  login() {
    // In a real app, this would involve form validation and an API call.
    // For this UI simulation, we just log the user in.
    this.userService.login();
  }
}
