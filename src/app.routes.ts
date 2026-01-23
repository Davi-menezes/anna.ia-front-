import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerificationSentComponent } from './components/verification-sent/verification-sent.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CreditsComponent } from './components/credits/credits.component';
import { VestibularesComponent } from './components/vestibulares/vestibulares.component';
import { StudyPlanComponent } from './components/study-plan/study-plan.component';
import { VerifyEmailComponent } from './app/components/verify-email/verify-email.component';
import { EmailVerifiedComponent } from './app/components/email-verified/email-verified.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { TermsComponent } from './components/terms/terms.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Anna.IA - Início', canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, title: 'Anna.IA - Login' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Anna.IA - Recuperar senha' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'Anna.IA - Redefinir senha' },
  { path: 'register', component: RegisterComponent, title: 'Anna.IA - Cadastro' },
  { path: 'terms', component: TermsComponent, title: 'Anna.IA - Termos de Uso' },
  { path: 'cadastro', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'verification-sent',
    component: VerificationSentComponent,
    title: 'Verificação de Email Enviado'
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
    title: 'Verificação de E-mail'
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
    title: 'Autenticando...'
  },
  {
    path: 'verify-email/:token',
    component: VerifyEmailComponent,
    title: 'Verificação de E-mail'
  },
  {
    path: 'email-verified',
    component: EmailVerifiedComponent,
    title: 'E-mail Verificado'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Anna.IA - Perfil',
    canActivate: [authGuard]
  },
  {
    path: 'credits',
    component: CreditsComponent,
    title: 'Anna.IA - Créditos',
    canActivate: [authGuard]
  },
  {
    path: 'vestibulares',
    component: VestibularesComponent,
    title: 'Anna.IA - Vestibulares',
    canActivate: [authGuard]
  },
  {
    path: 'study-plan',
    component: StudyPlanComponent,
    title: 'Anna.IA - Meu Plano de Estudos',
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
