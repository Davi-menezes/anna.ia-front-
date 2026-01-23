import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center p-4 relative">
      
      <!-- Background Effects -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-futuristic-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-futuristic-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <div class="w-full max-w-md max-h-full overflow-y-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 md:p-8 transform transition-all duration-300 scrollbar-hide">
        
        <div class="text-center mb-6">
          <h1 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-futuristic-primary to-futuristic-secondary mb-1">
            Anna.IA
          </h1>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
            Crie sua conta
          </h2>
          <p class="mt-1 text-xs text-gray-600 dark:text-slate-400">
            Comece sua jornada de aprendizado hoje
          </p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <!-- Name Input -->
          <div class="space-y-1">
            <label for="name" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Nome completo</label>
            <div class="relative">
              <input 
                id="name" 
                type="text" 
                formControlName="name"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm"
                placeholder="Seu nome completo"
              >
            </div>
            <p *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid" class="text-xs text-red-500 mt-1">
              Nome é obrigatório (min. 3 caracteres)
            </p>
          </div>

          <!-- Email Input -->
          <div class="space-y-1">
            <label for="email" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Email profissional</label>
            <div class="relative">
              <input 
                id="email" 
                type="email" 
                formControlName="email"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm"
                placeholder="seu@email.com"
              >
            </div>
            <p *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid" class="text-xs text-red-500 mt-1">
              Digite um email válido
            </p>
          </div>

          <!-- Password Input -->
          <div class="space-y-1">
            <label for="password" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Senha segura</label>
            <div class="relative">
              <input 
                id="password" 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm pr-10"
                placeholder="••••••••"
              >
              <button 
                type="button"
                (click)="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            <div *ngIf="registerForm.get('password')?.dirty" class="text-xs space-y-1 mt-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <p [ngClass]="{'text-green-500 font-medium': registerForm.get('password').value.length >= 6, 'text-gray-500 dark:text-slate-400': registerForm.get('password').value.length < 6}">
                  <span [textContent]="registerForm.get('password').value.length >= 6 ? '✓' : '•'" class="mr-2"></span>Pelo menos 6 caracteres
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasUpperCase(registerForm.get('password').value), 'text-gray-500 dark:text-slate-400': !hasUpperCase(registerForm.get('password').value)}">
                  <span [textContent]="hasUpperCase(registerForm.get('password').value) ? '✓' : '•'" class="mr-2"></span>Pelo menos uma letra maiúscula (A-Z)
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasLowerCase(registerForm.get('password').value), 'text-gray-500 dark:text-slate-400': !hasLowerCase(registerForm.get('password').value)}">
                  <span [textContent]="hasLowerCase(registerForm.get('password').value) ? '✓' : '•'" class="mr-2"></span>Pelo menos uma letra minúscula (a-z)
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasNumeric(registerForm.get('password').value), 'text-gray-500 dark:text-slate-400': !hasNumeric(registerForm.get('password').value)}">
                  <span [textContent]="hasNumeric(registerForm.get('password').value) ? '✓' : '•'" class="mr-2"></span>Pelo menos um número (0-9)
                </p>
                <p [ngClass]="{'text-green-500 font-medium': hasSpecial(registerForm.get('password').value), 'text-gray-500 dark:text-slate-400': !hasSpecial(registerForm.get('password').value)}">
                  <span [textContent]="hasSpecial(registerForm.get('password').value) ? '✓' : '•'" class="mr-2"></span>Pelo menos um caractere especial (ex: !@#$%)
                </p>
            </div>
          </div>

          <!-- New Fields Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="birthDate" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Data de Nascimento</label>
              <input 
                id="birthDate" 
                type="text" 
                formControlName="birthDate"
                placeholder="DD/MM/AAAA"
                (input)="onDateInput($event)"
                maxlength="10"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm"
              >
              <p *ngIf="registerForm.get('birthDate')?.touched && registerForm.get('birthDate')?.invalid" class="text-xs text-red-500">
                Data inválida (DD/MM/AAAA)
              </p>
            </div>

            <!-- Education -->
            <div class="space-y-1">
              <label for="education" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Escolaridade</label>
              <select 
                id="education" 
                formControlName="education"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm"
              >
                <option value="">Selecione...</option>
                <option value="Ensino Médio Cursando">Ensino Médio Cursando</option>
                <option value="Ensino Médio Completo">Ensino Médio Completo</option>
                <option value="Superior Cursando">Superior Cursando</option>
                <option value="Superior Completo">Superior Completo</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Location -->
            <div class="space-y-1">
              <label for="location" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Localização (Cidade/UF)</label>
              <input 
                id="location" 
                type="text" 
                formControlName="location"
                placeholder="Ex: Salvador, BA"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm"
              >
            </div>

            <!-- Main Goal -->
            <div class="space-y-1">
              <label for="mainGoal" class="block text-xs font-medium text-gray-700 dark:text-slate-300">Objetivo Principal</label>
              <input 
                id="mainGoal" 
                type="text" 
                formControlName="mainGoal"
                placeholder="Ex: Aprovação em Medicina"
                class="block w-full px-3 py-2 rounded-lg border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:border-futuristic-primary focus:ring-futuristic-primary transition-colors dark:text-white sm:text-sm"
              >
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="terms" 
                type="checkbox" 
                formControlName="terms"
                class="w-4 h-4 rounded border-gray-300 text-futuristic-primary focus:ring-futuristic-primary"
              >
            </div>
            <div class="ml-2 text-xs">
              <label for="terms" class="font-medium text-gray-700 dark:text-slate-300">
                Li e concordo com os <a routerLink="/terms" class="text-futuristic-primary hover:text-futuristic-secondary">Termos de Uso</a>
              </label>
              <p *ngIf="registerForm.get('terms')?.touched && registerForm.get('terms')?.invalid" class="text-red-500 mt-0.5">
                Obrigatório
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-2">
                <p class="text-xs text-red-700 dark:text-red-200">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="registerForm.invalid || isSubmitting"
            class="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-futuristic-primary to-futuristic-secondary hover:from-futuristic-secondary hover:to-futuristic-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary shadow-lg shadow-futuristic-primary/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isSubmitting">Criar conta gratuita</span>
            <div *ngIf="isSubmitting" class="flex items-center space-x-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Criando...</span>
            </div>
          </button>
        </form>

        <div class="mt-4">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-2 bg-white/0 dark:bg-slate-900/0 text-gray-500 backdrop-blur-sm">Ou entre com</span>
            </div>
          </div>

          <button 
            (click)="loginWithGoogle()"
            class="mt-4 w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary transition-all"
          >
            <img class="h-4 w-4 mr-2" src="https://www.google.com/favicon.ico" alt="Google">
            Google
          </button>
        </div>

        <p class="mt-6 text-center text-xs text-gray-600 dark:text-slate-400">
          Já tem uma conta?
          <a routerLink="/login" class="font-medium text-futuristic-primary hover:text-futuristic-secondary transition-colors">
            Fazer login
          </a>
        </p>

      </div>
    </div>
    
    <style>
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
  `
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();

  showPassword = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  registerForm: FormGroup;

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/)
      ]],
      birthDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/)]],
      education: ['', [Validators.required]],
      location: ['', [Validators.required]],
      mainGoal: ['', [Validators.required, Validators.minLength(5)]],
      terms: [false, [Validators.requiredTrue]]
    });

    // Remove scroll strictly
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    // Restore scroll
    document.body.style.overflow = 'auto';
    this.subscriptions.unsubscribe();
  }

  onSubmit() {
    if (this.registerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.successMessage = '';

    const { name, email, password, terms, birthDate, education, location, mainGoal } = this.registerForm.value;

    // Converter data de DD/MM/AAAA para YYYY-MM-DD para o backend
    let formattedBirthDate = birthDate;
    if (birthDate && birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/');
      formattedBirthDate = `${year}-${month}-${day}`;
    }

    // Garantir que terms seja boolean
    const termsValue = terms === true || terms === 'true';

    const registerSub = this.authService.register(name, email, password, termsValue, { birthDate: formattedBirthDate, education, location, mainGoal }).subscribe({
      next: (user) => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
        // Redirect to verification sent page with email in query params
        this.router.navigate(['/verification-sent'], {
          queryParams: { email: user.email }
        });
      },
      error: (error) => {
        this.isSubmitting = false;

        // Extract error message and code
        const errorCode = error.code || error.error?.code;

        if (errorCode === 'EMAIL_IN_USE') {
          // Show specific message and redirect to login with email prefilled
          this.error = `O e-mail ${email} já está cadastrado. Você será redirecionado para a página de login...`;
          this.cdr.markForCheck();

          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: {
                email: email,
                emailInUse: 'true'
              }
            });
          }, 2000);
        } else {
          // Handle validation errors from backend
          let errorMessage = 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.';

          if (error.error?.errors && Array.isArray(error.error.errors)) {
            // Backend validation errors - mostrar todos os erros
            const validationErrors = error.error.errors.map((err: any) => {
              const field = err.param || err.path || '';
              const msg = err.msg || err.message || '';
              return field ? `${field}: ${msg}` : msg;
            }).join('. ');
            errorMessage = validationErrors || errorMessage;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.error = errorMessage;
          this.cdr.markForCheck();
        }
      }
    });

    this.subscriptions.add(registerSub);
  }

  loginWithGoogle() {
    this.error = null;
    // FIX: Must subscribe to the Observable
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        // Redirection is handled in service or here if needed
      },
      error: (err) => {
        this.error = err.message || 'Erro ao conectar com Google.';
      }
    });
  }

  // Date masking helper
  onDateInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    if (value.length >= 5) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    event.target.value = value;
    this.registerForm.get('birthDate')?.setValue(value, { emitEvent: false });
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

