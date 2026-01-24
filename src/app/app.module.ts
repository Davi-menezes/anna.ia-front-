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
import { APP_ROUTES } from '../app.routes';

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
    RouterModule.forRoot(APP_ROUTES)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
