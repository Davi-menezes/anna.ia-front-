import { ChangeDetectionStrategy, Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-futuristic-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-futuristic-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <div class="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform transition-all relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-futuristic-primary/10 rounded-2xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-futuristic-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 class="text-3xl font-black text-futuristic-text dark:text-white mb-2">Recuperar Senha</h1>
          <p class="text-sm text-futuristic-subtext dark:text-dark-subtext">
            Digite seu e-mail para receber as instruções de redefinição.
          </p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-slate-300">E-mail</label>
            <input 
              id="email" 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required
              class="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-all dark:text-white"
              placeholder="seu@email.com"
            >
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading || !email"
            class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-futuristic-primary to-futuristic-secondary hover:from-futuristic-secondary hover:to-futuristic-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary shadow-lg shadow-futuristic-primary/30 transform transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <span *ngIf="!isLoading">Enviar link de recuperação</span>
            <svg *ngIf="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <div *ngIf="message" class="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium text-center">
          {{ message }}
        </div>

        <div *ngIf="error" class="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
          {{ error }}
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
          <a routerLink="/login" class="text-sm font-bold text-futuristic-primary hover:text-futuristic-secondary transition-colors">
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  isLoading = false;
  message: string | null = null;
  error: string | null = null;

  constructor() { }

  onSubmit() {
    if (!this.email) return;

    this.isLoading = true;
    this.message = null;
    this.error = null;

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        // err.error contém o corpo JSON do servidor; err.message é o texto HTTP genérico
        const serverMessage: string = err.error?.message || '';
        const status: number = err.status ?? 0;

        if (status === 404) {
          this.error = 'Nenhuma conta encontrada com este e-mail. Verifique o endereço ou crie uma conta nova.';
        } else if (status === 503 || err.error?.code === 'EMAIL_SERVICE_RESTRICTED') {
          this.error = serverMessage || 'O serviço de e-mail está temporariamente indisponível. Tente fazer login com o Google ou entre em contato com o suporte.';
        } else if (status === 429) {
          this.error = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        } else {
          this.error = serverMessage || 'Não foi possível enviar o e-mail de recuperação. Verifique sua conexão e tente novamente.';
        }

        this.cdr.markForCheck();
      }
    });
  }
}
