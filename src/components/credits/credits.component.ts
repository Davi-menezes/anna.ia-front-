import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

interface CreditPackage {
  amount: number;
  price: string;
  description: string;
  popular?: boolean;
}

@Component({
  selector: 'app-credits',
  standalone: true,
  templateUrl: './credits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CreditsComponent {
  userService = inject(UserService);

  packages: CreditPackage[] = [
    { amount: 10, price: 'R$ 4,99', description: 'Para começar.' },
    { amount: 50, price: 'R$ 19,99', description: 'Melhor custo-benefício.', popular: true },
    { amount: 100, price: 'R$ 34,99', description: 'Para estudantes dedicados.' },
  ];

  // FIX: Use constructor injection for Router to fix type inference issue.
  constructor(private router: Router) {}

  buyCredits(amount: number) {
    this.userService.addCredits(amount);
    this.router.navigate(['/profile']); // Navigate to profile to see the new balance
  }
}
