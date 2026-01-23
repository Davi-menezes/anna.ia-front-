import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authTokenKey = 'token';
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loadUser();
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleGoogleCallback(): Observable<any> {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');

    if (token) {
      this.setAuthToken(token);
      return this.getCurrentUser().pipe(
        tap(() => {
          this.router.navigate(['/dashboard']);
        }),
        catchError(error => {
          this.handleAuthError(error);
          return throwError(error);
        })
      );
    } else if (error) {
      this.handleAuthError({ error: { error } });
      return throwError(error);
    }
    return throwError('No token or error found in URL');
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setAuthToken(response.token);
        }
      }),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(error);
      })
    );
  }

  private getCurrentUser(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/me`, { withCredentials: true }).pipe(
      tap((user: any) => {
        if (user && user.user) {
          this.currentUserSubject.next(user.user);
        }
      }),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(error);
      })
    );
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
  }

  private loadUser(): void {
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  handleAuthError(error: any): void {
    let errorMessage = 'Ocorreu um erro ao autenticar.';

    if (error.error?.error === 'redirect_uri_mismatch') {
      errorMessage = 'Erro de configuração do Google OAuth. Por favor, entre em contato com o suporte.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }

    this.notificationService.showError(errorMessage);
    this.router.navigate(['/login']);
  }

  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.authTokenKey);
  }

  getCurrentUserValue(): any {
    return this.currentUserSubject.value;
  }
}



