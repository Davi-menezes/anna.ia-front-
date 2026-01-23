import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-verification',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-futuristic-primary/10 to-futuristic-secondary/10 dark:from-slate-900/50 dark:to-slate-800/50 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/40 dark:border-slate-700/50 p-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-futuristic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-futuristic-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verificação de E-mail</h2>
          
          <div *ngIf="!isVerifying && !verificationError && !isResending && !resendSuccess" class="text-gray-600 dark:text-gray-300 mb-6">
            <p>Um link de verificação foi enviado para o seu e-mail.</p>
            <p class="font-medium">{{ email }}</p>
          </div>

          <div *ngIf="isVerifying" class="mb-6">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-futuristic-primary"></div>
            </div>
            <p class="mt-4 text-gray-600 dark:text-gray-300">Verificando seu e-mail...</p>
          </div>

          <div *ngIf="verificationSuccess" class="mb-6">
            <div class="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg">
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>E-mail verificado com sucesso! Redirecionando...</span>
              </div>
            </div>
          </div>

          <div *ngIf="verificationError" class="mb-6">
            <div class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
              <div class="flex items-start">
                <svg class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="font-medium">Falha na verificação</p>
                  <p class="text-sm">{{ verificationError }}</p>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="isResending" class="mb-6">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-futuristic-primary mr-2"></div>
              <span class="text-gray-600 dark:text-gray-300">Enviando e-mail de verificação...</span>
            </div>
          </div>

          <div *ngIf="resendSuccess" class="mb-6">
            <div class="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg">
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>E-mail de verificação reenviado com sucesso!</span>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <button 
              *ngIf="!verificationSuccess && !isVerifying && !verificationError"
              (click)="resendVerificationEmail()" 
              [disabled]="isResending"
              class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-futuristic-primary hover:bg-futuristic-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Reenviar e-mail de verificação
            </button>
            
            <a 
              href="/login" 
              class="mt-4 block text-center text-sm text-futuristic-primary hover:text-futuristic-secondary dark:text-futuristic-primary/80 dark:hover:text-futuristic-secondary transition-colors"
            >
              Voltar para o login
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VerificationComponent implements OnInit {
  email: string = '';
  token: string | null = null;
  isVerifying = false;
  verificationSuccess = false;
  verificationError: string | null = null;
  isResending = false;
  resendSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check for email parameter for resend functionality
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });

    // Check for token parameter for email verification
    this.route.params.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        this.verifyEmail();
      }
    });
  }

  verifyEmail() {
    if (!this.token) return;
    
    this.isVerifying = true;
    this.verificationError = null;
    
    this.authService.verifyEmail(this.token).pipe(first()).subscribe({
      next: () => {
        this.verificationSuccess = true;
        this.isVerifying = false;
        
        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
        }, 2000);
      },
      error: (error) => {
        console.error('Verification error:', error);
        this.verificationError = error.message || 'Ocorreu um erro ao verificar seu e-mail. Por favor, tente novamente.';
        this.isVerifying = false;
      }
    });
  }

  resendVerificationEmail() {
    if (!this.email) {
      this.verificationError = 'Nenhum e-mail fornecido para reenviar a verificação.';
      return;
    }

    this.isResending = true;
    this.resendSuccess = false;
    this.verificationError = null;

    this.authService.resendVerificationEmail(this.email).pipe(first()).subscribe({
      next: () => {
        this.resendSuccess = true;
        this.isResending = false;
      },
      error: (error) => {
        console.error('Resend verification error:', error);
        this.verificationError = error.message || 'Ocorreu um erro ao reenviar o e-mail de verificação. Por favor, tente novamente.';
        this.isResending = false;
      }
    });
  }
}
