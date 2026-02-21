import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RegisterService } from './services/register.service';
import { NotificationService } from './services/notification.service';
import { AuthGuard } from './guards/auth.guard';

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
    RouterModule.forRoot(APP_ROUTES),
    MarkdownModule.forRoot({ loader: HttpClient, katex: true })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
