import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { AlertNotificationService } from '../../services/alert-notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private router: Router,
    private alertService: AlertNotificationService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      console.log('Formulário inválido:', this.registerForm.errors);
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        console.log(`Campo ${key} erros:`, control?.errors);
      });
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { confirmPassword, ...userData } = this.registerForm.value;
    console.log('Enviando dados para registro:', userData);

    this.registerService.register(userData).subscribe({
      next: (response) => {
        console.log('Resposta do registro:', response);
        this.isLoading = false;
        this.alertService.showSuccess('Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erro no registro completo:', error);
        
        // SEMPRE desativa o loading primeiro
        this.isLoading = false;
        
        // Extrai a mensagem de erro de diferentes formatos possíveis
        let errorMessage = 'Erro ao criar conta. Por favor, tente novamente.';
        let isEmailInUse = false;
        
        // Verifica diferentes formatos de erro
        if (error?.error) {
          // Erro HTTP com error.error
          if (error.error.code === 'EMAIL_IN_USE' || error.error.message?.toLowerCase().includes('já está em uso') || error.error.message?.toLowerCase().includes('already in use')) {
            isEmailInUse = true;
            errorMessage = 'Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.';
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error?.code === 'EMAIL_IN_USE' || error?.message?.toLowerCase().includes('já está em uso') || error?.message?.toLowerCase().includes('already in use')) {
          // Erro direto com code ou message
          isEmailInUse = true;
          errorMessage = 'Este e-mail já está cadastrado. Por favor, use outro e-mail ou faça login.';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        console.log('Mensagem de erro a ser exibida:', errorMessage);
        console.log('É email em uso?', isEmailInUse);
        
        // Define a mensagem de erro
        this.error = errorMessage;
        
        // Destaca o campo de e-mail em caso de erro de e-mail em uso
        if (isEmailInUse && this.email) {
          this.email.setErrors({ 'emailInUse': true });
          this.registerForm.markAsTouched();
        }
        
        // Exibe o popup de erro
        setTimeout(() => {
          try {
            if (this.alertService && typeof this.alertService.showError === 'function') {
              this.alertService.showError(errorMessage);
            } else {
              alert(errorMessage);
            }
          } catch (e) {
            console.error('Erro ao exibir notificação:', e);
            alert(errorMessage); // Fallback para garantir que o usuário veja a mensagem
          }
        }, 100);
      }
    });
  }

  // Helper methods for template
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
