import './src/styles.css';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { AppComponent } from './src/app.component';
import { APP_ROUTES } from './src/app.routes';
import { authInterceptor } from './src/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(MarkdownModule.forRoot({ loader: HttpClient, katex: true })),
  ],
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
