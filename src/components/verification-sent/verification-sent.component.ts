import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verification-sent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-futuristic-primary/10 to-futuristic-secondary/10 dark:from-slate-900/50 dark:to-slate-800/50 relative overflow-hidden">
      
      <!-- Background Effects -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-futuristic-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-futuristic-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <div class="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform transition-all hover:scale-[1.01] duration-300 relative z-10">
        
        <div class="text-center mb-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <svg class="h-8 w-8 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Verifique seu email
          </h2>
          
          <p class="text-sm text-gray-600 dark:text-slate-300 mb-2">
            Enviamos um link de confirmação para o seu endereço de email.
          </p>
          
          <p *ngIf="email" class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {{ email }}
          </p>
          
          <p class="text-sm text-gray-600 dark:text-slate-300 mb-8">
            Clique no link para ativar sua conta e começar a aprender.
          </p>

          <div *ngIf="resendSuccess" class="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <p class="text-xs text-green-700 dark:text-green-200">E-mail reenviado com sucesso!</p>
          </div>

          <div *ngIf="resendError" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p class="text-xs text-red-700 dark:text-red-200">{{ resendError }}</p>
          </div>

          <div class="space-y-4">
            <a routerLink="/login" 
               class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-futuristic-primary to-futuristic-secondary hover:from-futuristic-secondary hover:to-futuristic-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary shadow-lg shadow-futuristic-primary/30 transform transition-all active:scale-[0.98]">
              Voltar para o Login
            </a>
            
            <p class="text-xs text-gray-500 dark:text-slate-500">
              Não recebeu? 
              <button 
                (click)="resendVerification()" 
                [disabled]="isResending || !email"
                class="text-futuristic-primary hover:text-futuristic-secondary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isResending ? 'Enviando...' : 'Reenviar email' }}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerificationSentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  email: string | null = null;
  isResending = false;
  resendSuccess = false;
  resendError: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || null;
    });
  }

  resendVerification() {
    if (!this.email || this.isResending) return;

    this.isResending = true;
    this.resendSuccess = false;
    this.resendError = null;

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.resendSuccess = true;
        this.resendError = null;
      },
      error: (error) => {
        this.isResending = false;
        this.resendSuccess = false;
        this.resendError = error.message || 'Erro ao reenviar e-mail. Tente novamente.';
      }
    });
  }
}
