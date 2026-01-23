import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4 relative overflow-hidden py-12">
      <!-- Background Effects -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-futuristic-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-futuristic-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <div class="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform transition-all relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-futuristic-secondary/10 rounded-2xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-futuristic-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 class="text-3xl font-black text-futuristic-text dark:text-white mb-2">Nova Senha</h1>
          <p class="text-sm text-futuristic-subtext dark:text-dark-subtext">
            Crie uma senha forte para proteger sua conta.
          </p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Nova Senha</label>
            <div class="relative">
              <input 
                id="password" 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password"
                class="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-all dark:text-white pr-12"
                placeholder="••••••••"
              >
              <button type="button" (click)="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-futuristic-primary transition-colors">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.04m4.066-1.56a10.048 10.048 0 013.913-1.4c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.04m-4.595-4.595a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                </svg>
              </button>
            </div>

            <!-- Password strength indicators -->
            <div class="grid grid-cols-1 gap-1 text-[10px] mt-2">
                <p [ngClass]="{'text-green-500 font-medium': resetForm.get('password')?.value?.length >= 8, 'text-gray-400': !(resetForm.get('password')?.value?.length >= 8)}">
                  <span [textContent]="resetForm.get('password')?.value?.length >= 8 ? '✓' : '•'" class="mr-1"></span>Pelo menos 8 caracteres
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasUpperCase(resetForm.get('password')?.value), 'text-gray-400': !hasUpperCase(resetForm.get('password')?.value)}">
                  <span [textContent]="hasUpperCase(resetForm.get('password')?.value) ? '✓' : '•'" class="mr-1"></span>Uma letra maiúscula
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasLowerCase(resetForm.get('password')?.value), 'text-gray-400': !hasLowerCase(resetForm.get('password')?.value)}">
                  <span [textContent]="hasLowerCase(resetForm.get('password')?.value) ? '✓' : '•'" class="mr-1"></span>Uma letra minúscula
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasNumeric(resetForm.get('password')?.value), 'text-gray-400': !hasNumeric(resetForm.get('password')?.value)}">
                  <span [textContent]="hasNumeric(resetForm.get('password')?.value) ? '✓' : '•'" class="mr-1"></span>Um número
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasSpecial(resetForm.get('password')?.value), 'text-gray-400': !hasSpecial(resetForm.get('password')?.value)}">
                  <span [textContent]="hasSpecial(resetForm.get('password')?.value) ? '✓' : '•'" class="mr-1"></span>Um caractere especial
                </p>
            </div>
          </div>

          <div class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Confirmar Senha</label>
            <div class="relative">
              <input 
                id="confirmPassword" 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                formControlName="confirmPassword"
                class="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-all dark:text-white pr-12"
                placeholder="••••••••"
              >
              <button type="button" (click)="showConfirmPassword = !showConfirmPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-futuristic-primary transition-colors">
                <svg *ngIf="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.04m4.066-1.56a10.048 10.048 0 013.913-1.4c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.04m-4.595-4.595a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                </svg>
              </button>
            </div>
            <div *ngIf="resetForm.errors?.['mismatch'] && resetForm.get('confirmPassword')?.touched" class="text-xs text-red-500 mt-1">
              As senhas não coincidem.
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading || resetForm.invalid"
            class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-futuristic-primary to-futuristic-secondary hover:from-futuristic-secondary hover:to-futuristic-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary shadow-lg shadow-futuristic-primary/30 transform transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <span *ngIf="!isLoading">Redefinir Senha</span>
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
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  message: string | null = null;
  error: string | null = null;
  token: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[A-Z]/),
        Validators.pattern(/[a-z]/),
        Validators.pattern(/\d/),
        Validators.pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Token de redefinição não encontrado.';
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.message = null;
    this.error = null;

    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message + ' Redirecionando para o login...';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || 'Erro ao redefinir senha.';
        this.cdr.markForCheck();
      }
    });
  }

  // Password validation helpers for template
  hasUpperCase(value: string): boolean {
    return /[A-Z]/.test(value || '');
  }
  hasLowerCase(value: string): boolean {
    return /[a-z]/.test(value || '');
  }
  hasNumeric(value: string): boolean {
    return /\d/.test(value || '');
  }
  hasSpecial(value: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value || '');
  }
}
