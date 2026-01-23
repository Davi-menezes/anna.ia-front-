
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading = false;
  isGoogleLoading = false;
  error: string | null = null;
  private subscriptions = new Subscription();

  ngOnInit() {
  }

  login() {
    if (this.isLoading || this.isGoogleLoading) return;

    this.isLoading = true;
    this.error = null;

    const loginSub = this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Redirecionamento é tratado pelo AuthService após o login bem-sucedido
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;

        // Handle specific error codes or messages
        const errorCode = err.code || err.error?.code;
        const errorMessage = err.error?.message || err.message;

        if (errorCode === 'EMAIL_NOT_VERIFIED' || errorMessage?.includes('verifique seu e-mail')) {
          this.error = '⚠️ <b>E-mail não verificado.</b><br>Por favor, verifique sua caixa de entrada para ativar sua conta. ' +
            'Não recebeu? <a href="/verify-email?email=' + encodeURIComponent(this.email) + '" class="text-futuristic-primary hover:underline font-bold">Reenviar e-mail</a>';
        } else if (errorCode === 'INVALID_EMAIL') {
          this.error = '❌ <b>E-mail não encontrado.</b><br>Não existe nenhuma conta associada a este endereço de e-mail.';
        } else if (errorCode === 'INVALID_PASSWORD') {
          this.error = '❌ <b>Senha incorreta.</b><br>A senha inserida não coincide com nossos registros.';
        } else {
          this.error = errorMessage || 'Erro ao fazer login. Verifique suas credenciais.';
        }

        this.cdr.markForCheck();
      }
    });

    this.subscriptions.add(loginSub);
  }

  loginWithGoogle() {
    if (this.isLoading || this.isGoogleLoading) return;

    this.isGoogleLoading = true;
    this.error = null;

    const googleSub = this.authService.loginWithGoogle().subscribe({
      error: (err) => {
        this.error = err.message || 'Erro ao fazer login com o Google. Tente novamente.';
        this.isGoogleLoading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isGoogleLoading = false;
        this.cdr.markForCheck();
      }
    });

    this.subscriptions.add(googleSub);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }
}
