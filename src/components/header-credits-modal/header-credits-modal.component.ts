
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
    // Evita divisão por zero e limita ao máximo de 100%
    if (maxCredits === 0) return 0;
    return Math.min((credits / maxCredits) * 100, 100);
  });

  packages: CreditPackage[] = [
    { amount: 10, price: 'R$ 7,90', description: 'Para começar.' },
    { amount: 50, price: 'R$ 19,90', description: 'Melhor custo-benefício.', popular: true },
    { amount: 150, price: 'R$ 39,90', description: 'Para estudantes dedicados.' },
    { amount: 500, price: 'R$ 59,90', description: 'Plano Premium: 500 créditos/mês + Plano de Estudos.' },
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
