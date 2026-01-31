
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
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
  selector: 'app-header-credits-modal',
  standalone: true,
  templateUrl: './header-credits-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class HeaderCreditsModalComponent {
  isOpen = input.required<boolean>();
  close = output<void>();

  userService = inject(UserService);

  creditPercentage = computed(() => {
    const credits = this.userService.credits();
    const maxCredits = this.userService.maxCredits;
    // Avoid division by zero and handle cases where credits might exceed maxCredits
    if (maxCredits === 0) return 0;
    return Math.min((credits / maxCredits) * 100, 100);
  });

  packages: CreditPackage[] = [
    { amount: 20, price: 'R$ 9,90', description: '1 simulado + chat' },
    { amount: 60, price: 'R$ 29,90', description: '5 simulados', popular: true },
    { amount: 120, price: 'R$ 49,90', description: '10 simulados' },
    { amount: 500, price: 'R$ 99,90', description: 'Plano Premium: 500 créditos/mês' },
  ];

  constructor(private router: Router) {}

  onClose() {
    this.close.emit();
  }

  goToCreditsPage() {
    this.router.navigate(['/credits']);
    this.onClose();
  }
}
