
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CreditsComponent } from './components/credits/credits.component';
import { VestibularesComponent } from './components/vestibulares/vestibulares.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Anna.IA - Início' },
  { path: 'login', component: LoginComponent, title: 'Anna.IA - Login' },
  { path: 'profile', component: ProfileComponent, title: 'Anna.IA - Perfil' },
  { path: 'credits', component: CreditsComponent, title: 'Anna.IA - Créditos' },
  { path: 'vestibulares', component: VestibularesComponent, title: 'Anna.IA - Vestibulares' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
