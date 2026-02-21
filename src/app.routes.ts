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
import { FlashcardsComponent } from './components/flashcards/flashcards.component';
import { QuestionGoalsComponent } from './components/question-goals/question-goals.component';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Anna.IA - Início',
    data: {
      description: 'Prepare-se para o vestibular com o Anna.IA. Planos de estudo personalizados, simulados e flashcards inteligentes.',
      keywords: 'estudo personalizado, vestibular, enem, simulados, flashcards, ia educação'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Anna.IA - Login',
    data: {
      description: 'Acesse sua conta Anna.IA e continue sua jornada rumo à aprovação.',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Anna.IA - Recuperar senha',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Anna.IA - Redefinir senha',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Anna.IA - Cadastro',
    data: {
      description: 'Cadastre-se na Anna.IA e comece seu plano de estudos inteligente hoje mesmo.',
      keywords: 'cadastro anna ia, novo usuario'
    }
  },
  {
    path: 'terms',
    component: TermsComponent,
    title: 'Anna.IA - Termos de Uso',
    data: {
      description: 'Termos de uso e condições do serviço Anna.IA.',
      robots: 'index, nofollow'
    }
  },
  { path: 'cadastro', redirectTo: 'register', pathMatch: 'full' },
  {
    path: 'verification-sent',
    component: VerificationSentComponent,
    title: 'Verificação de Email Enviado',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
    title: 'Verificação de E-mail',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
    title: 'Autenticando...',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'verify-email/:token',
    component: VerifyEmailComponent,
    title: 'Verificação de E-mail',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'email-verified',
    component: EmailVerifiedComponent,
    title: 'E-mail Verificado',
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Anna.IA - Perfil',
    canActivate: [authGuard],
    data: { robots: 'noindex, nofollow' }
  },
  {
    path: 'credits',
    component: CreditsComponent,
    title: 'Anna.IA - Créditos',
    canActivate: [authGuard],
    data: {
      description: 'Adquira créditos para usar os recursos avançados de IA da Anna.',
      keywords: 'comprar creditos, anna ia premium'
    }
  },
  {
    path: 'vestibulares',
    component: VestibularesComponent,
    title: 'Anna.IA - Vestibulares',
    canActivate: [authGuard],
    data: {
      description: 'Informações atualizadas sobre os principais vestibulares do Brasil: ENEM, FUVEST, UNICAMP e mais.',
      keywords: 'calendario vestibular, datas enem, inscricoes vestibular'
    }
  },
  {
    path: 'study-plan',
    component: StudyPlanComponent,
    title: 'Anna.IA - Meu Plano de Estudos',
    canActivate: [authGuard],
    data: {
      description: 'Seu cronograma de estudos personalizado gerado por inteligência artificial.',
      keywords: 'cronograma de estudos, plano personalizado, foco vestibular'
    }
  },
  {
    path: 'flashcards',
    component: FlashcardsComponent,
    title: 'Anna.IA - Flashcards',
    canActivate: [authGuard],
    data: {
      description: 'Aumente sua memorização com flashcards inteligentes e revisão espaçada.',
      keywords: 'estudo memoria, flashcards, revisao espacada'
    }
  },
  {
    path: 'question-goals',
    component: QuestionGoalsComponent,
    title: 'Anna.IA - Meta de Questões',
    canActivate: [authGuard],
    data: {
      description: 'Defina e acompanhe suas metas diárias de resolução de questões.',
      keywords: 'metas de estudo, progresso diario, questoes vestibular'
    }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
