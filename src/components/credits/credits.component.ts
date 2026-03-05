import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../app/services/notification.service';
import { AuthService } from '../../app/services/auth.service';

interface CreditPackage {
  amount: number;
  price: string;
  description: string;
  popular?: boolean;
  paymentLink: string;
}

@Component({
  selector: 'app-credits',
  standalone: true,
  templateUrl: './credits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styles: [`
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `]
})
export class CreditsComponent {
  userService = inject(UserService);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  packages: CreditPackage[] = [
    {
      amount: 10,
      price: 'R$ a',
      description: 'Para começar.',
      paymentLink: 'https://mpago.la/1zuxEKQ'
    },
    {
      amount: 50,
      price: 'R$ 19,90',
      description: 'Melhor custo-benefício.',
      popular: true,
      paymentLink: 'https://mpago.la/1YGYeLu'
    },
    {
      amount: 150,
      price: 'R$ 39,90',
      description: 'Para estudantes dedicados.',
      paymentLink: 'https://mpago.la/1YGYeLu'
    },
    {
      amount: 500,
      price: 'R$ 59,90',
      description: 'Plano Premium: 500 créditos/mês + Plano de Estudos.',
      paymentLink: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=142b689221fd40dba4fdcfd272339f4c'
    }
  ];

  get userId(): string | null {
    const user = this.authService.getCurrentUserValue();
    return user ? user.id : null;
  }

  // Injeção via construtor para corrigir inferência de tipo do Router
  constructor(private router: Router) { }

  getPackagePriceString(amount: number): string {
    const pkg = this.packages.find(p => p.amount === amount);
    return pkg ? pkg.price.replace('R$ ', '') : '0,00';
  }

  async buyCredits(pkg: CreditPackage) {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.userId;
    if (!userId) {
      this.notificationService.showError('Erro ao identificar usuário. Por favor, faça login novamente.');
      return;
    }

    // Adiciona o external_reference (userId) ao link de pagamento
    const separator = pkg.paymentLink.includes('?') ? '&' : '?';
    const finalLink = `${pkg.paymentLink}${separator}external_reference=${userId}`;

    window.open(finalLink, '_blank');
  }

  getPackagePrice(amount: number): number {
    const pkg = this.packages.find(p => p.amount === amount);
    if (!pkg) return 0;
    // Extrai o número do formato "R$ 7,90"
    return parseFloat(pkg.price.replace('R$ ', '').replace(',', '.'));
  }
}
