import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-futuristic-primary/10 to-futuristic-secondary/10 dark:from-slate-900/50 dark:to-slate-800/50 overflow-hidden relative">
      <!-- Background Effects -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-futuristic-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-futuristic-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <div class="w-full max-w-md relative z-10">
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/40 dark:border-slate-700/50 p-8 text-center">
          
          <!-- Logo/Icon -->
          <div class="flex justify-center mb-6">
            <div class="h-20 w-20 rounded-2xl bg-futuristic-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-futuristic-primary" [class.animate-bounce]="isLoading" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>

          <h2 class="text-3xl font-bold text-futuristic-text dark:text-white mb-2">
            {{ isLoading ? 'Verificando...' : (error ? 'Oops!' : 'E-mail Verificado!') }}
          </h2>
          <p class="text-futuristic-subtext dark:text-slate-400 mb-8">
            {{ isLoading ? 'Estamos validando seu link de acesso.' : (error ? 'Houve um problema com seu link.' : 'Sua conta está pronta para uso.') }}
          </p>
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col items-center">
            <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
              <div class="bg-futuristic-primary h-full rounded-full animate-progress-indefinite"></div>
            </div>
            <span class="text-xs text-futuristic-primary font-medium animate-pulse">Isso levará apenas alguns segundos...</span>
          </div>
          
          <!-- Success State -->
          <div *ngIf="!isLoading && !error && successMessage" class="space-y-6">
            <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-600 dark:text-green-400 text-sm font-medium">
              <div class="flex items-center justify-center gap-2 mb-1">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>{{ successMessage }}</span>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="space-y-6">
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
              <p class="font-medium mb-3">{{ error }}</p>
              <button (click)="resendVerification()" class="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-red-600/20">
                Reenviar e-mail de verificação
              </button>
            </div>
          </div>

          <!-- Footer Action (Optional) -->
          <div class="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
             <a routerLink="/login" class="text-sm font-medium text-futuristic-primary hover:text-futuristic-secondary transition-colors">
               Voltar para o login
             </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VerifyEmailComponent implements OnInit {
  token: string = '';
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  email: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Verifica tanto path params quanto query params
    this.route.params.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });

    this.route.queryParams.subscribe(params => {
      // Se não tiver token nos path params, tenta nos query params
      if (!this.token) {
        this.token = params['token'] || '';
      }
      this.email = params['email'] || null;

      console.log('VerifyEmailComponent - Token recebido:', this.token ? `${this.token.substring(0, 10)}...` : 'Nenhum');
      console.log('VerifyEmailComponent - Email recebido:', this.email);

      if (this.token) {
        this.verifyEmail();
      } else {
        this.error = 'Token de verificação não fornecido.';
        this.isLoading = false;
      }
    });
  }

  verifyEmail() {
    if (!this.token) {
      this.error = 'Token de verificação inválido.';
      this.isLoading = false;
      return;
    }

    console.log('VerifyEmailComponent - Iniciando verificação com token:', this.token.substring(0, 10) + '...');
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.authService.verifyEmail(this.token).subscribe({
      next: (response) => {
        console.log('Resposta da verificação de e-mail:', response);
        this.isLoading = false;
        this.successMessage = 'Seu e-mail foi verificado com sucesso! Redirecionando...';
        this.cdr.markForCheck();

        // Atualiza o status do usuário para 'verified' no serviço de autenticação
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          currentUser.status = 'verified';
          this.authService['currentUserSubject'].next(currentUser);
        }

        // Redireciona para a página de e-mail verificado após breve delay
        setTimeout(() => {
          this.router.navigate(['/email-verified'], {
            queryParams: {
              email: this.email,
              verified: 'true'
            },
            replaceUrl: true
          });
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = err.error?.message || err.message || 'Ocorreu um erro ao verificar seu e-mail. Por favor, tente novamente.';

        if (err.error?.code === 'TOKEN_EXPIRED' || err.error?.message?.toLowerCase().includes('expirado')) {
          this.error = 'O link de verificação expirou. Por favor, solicite um novo link.';
        } else if (err.error?.code === 'INVALID_TOKEN' || err.error?.message?.toLowerCase().includes('inválido')) {
          this.error = 'O link de verificação é inválido. Por favor, solicite um novo link.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  resendVerification() {
    if (!this.email) {
      this.error = 'Nenhum e-mail disponível para reenviar a verificação.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = `Um novo e-mail de verificação foi enviado para ${this.email}. Por favor, verifique sua caixa de entrada.`;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = err.error?.message || err.message || 'Ocorreu um erro ao reenviar o e-mail de verificação. Por favor, tente novamente.';

        if (err.error?.code === 'EMAIL_ALREADY_VERIFIED') {
          this.error = 'Este e-mail já foi verificado. Você será redirecionado para o login...';
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { email: this.email },
              replaceUrl: true
            });
          }, 3000);
        }
        this.cdr.markForCheck();
      }
    });
  }
}
