
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface CreditPackage {
  amount: number;
  price: string;
  description: string;
  popular?: boolean;
}

@Component({
  selector: 'app-plans-modal',
  standalone: true,
  templateUrl: './plans-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class PlansModalComponent {
  isOpen = input.required<boolean>();
  close = output<void>();

  packages: CreditPackage[] = [
    { amount: 10, price: 'R$ 4,99', description: 'Para começar.' },
    { amount: 50, price: 'R$ 19,99', description: 'Melhor custo-benefício.', popular: true },
    { amount: 100, price: 'R$ 34,99', description: 'Para estudantes dedicados.' },
  ];

  constructor(private router: Router) {}

  onClose() {
    this.close.emit();
  }

  goToCreditsPage(pkg: CreditPackage) {
    this.router.navigate(['/credits']);
    this.onClose();
  }
}
