import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { RegisterComponent } from './components/register/register.component';
import { EmailVerifiedComponent } from './components/email-verified/email-verified.component';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RegisterService } from './services/register.service';
import { NotificationService } from './services/notification.service';

@NgModule({
  declarations: [
    AppComponent,
    AuthCallbackComponent,
    VerifyEmailComponent,
    RegisterComponent,
    EmailVerifiedComponent
  ],
  providers: [
    RegisterService,
    NotificationService,
    AuthGuard
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { 
        path: 'email-verified', 
        component: EmailVerifiedComponent 
      },
      { 
        path: 'verify-email', 
        component: VerifyEmailComponent 
      },
      { 
        path: 'auth/callback', 
        component: AuthCallbackComponent 
      },
      { 
        path: 'register',
        component: RegisterComponent
      },
      { 
        path: 'login', 
        loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
      },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      { 
        path: '', 
        redirectTo: '/login', 
        pathMatch: 'full' 
      },
      { 
        path: '**', 
        redirectTo: '/login' 
      }
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
