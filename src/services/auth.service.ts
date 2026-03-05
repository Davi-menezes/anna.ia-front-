import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  status: 'created' | 'verified' | 'premium';
  credits: number;
  role: string;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  birthDate?: string;
  education?: string;
  location?: string;
  mainGoal?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl;

  redirectUrl: string | null = null;

  private normalizeCredits(value: any): number {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) return n;
    return 5;
  }

  constructor() {
    this.initialCheck();
  }

  private initialCheck() {
    const token = this.getToken();
    if (token) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  register(name: string, email: string, password: string, terms: boolean, extraData?: any): Observable<User> {
    const payload = { name, email, password, terms, ...extraData };
    const targetUrl = `${this.apiUrl}/auth/register`;
    console.log('AuthService: Enviando registro para:', targetUrl);
    console.log('AuthService: Payload:', { ...payload, password: '***' });

    return this.http.post<AuthResponse>(targetUrl, payload).pipe(
      map(response => {
        console.log('AuthService: Resposta recebida do backend:', response);
        if (!response.success || !response.user) {
          console.error('AuthService: Falha na validação da resposta:', response);
          throw new Error(response.message || 'Falha no cadastro');
        }
        return response.user;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.code === 'EMAIL_IN_USE') {
          return throwError(() => ({ ...error.error, code: 'EMAIL_IN_USE' }));
        }
        if (error.status === 400 && error.error?.errors) {
          return throwError(() => ({
            message: error.error.message || 'Erro de validação',
            error: error.error
          }));
        }
        return this.handleError(error);
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      map(response => {
        if (!response.success || !response.user || !response.token) {
          const error: any = new Error(response.message || 'Falha no login');
          if (response.message === 'Por favor, verifique seu e-mail para ativar sua conta.') {
            error.code = 'EMAIL_NOT_VERIFIED';
          }
          throw error;
        }

        this.setToken(response.token);
        const userWithCredits = { ...response.user, credits: this.normalizeCredits(response.user.credits) };
        this.currentUserSubject.next(userWithCredits);

        if (this.redirectUrl) {
          this.router.navigate([this.redirectUrl]);
          this.redirectUrl = null;
        } else {
          this.router.navigate(['/profile']);
        }

        return userWithCredits;
      }),
      catchError((error: any) => {
        if (error.error?.code === 'EMAIL_NOT_VERIFIED' || error.error?.message?.includes('verifique seu e-mail')) {
          const customError: any = new Error(error.error?.message || 'Por favor, verifique seu e-mail para ativar sua conta.');
          customError.code = 'EMAIL_NOT_VERIFIED';
          return throwError(() => customError);
        }
        return this.handleError(error);
      })
    );
  }

  loginWithGoogle(): Observable<void> {
    window.location.href = `${this.apiUrl}/auth/google`;
    return new Observable();
  }

  handleGoogleCallback(): Observable<User> {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');

    if (token) {
      this.setToken(token);
      return this.fetchCurrentUser().pipe(
        tap(() => {
          this.router.navigate(['/']);
        }),
        catchError(err => {
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else if (error) {
      this.router.navigate(['/login']);
      return throwError(() => new Error(error));
    }

    this.router.navigate(['/login']);
    return throwError(() => new Error('No token or error found in URL'));
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/auth/verify-email/${token}`;
    return this.http.get<{ message: string }>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          message: error.error?.message || 'Falha ao verificar o e-mail. O link pode ter expirado ou ser inválido.'
        }));
      })
    );
  }

  resendVerificationEmail(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/resend-verification`, { email }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => ({
          message: error.error?.message || 'Falha ao reenviar o e-mail de verificação. Por favor, tente novamente.'
        }));
      })
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<{ success: boolean, user: User }>(`${this.apiUrl}/auth/me`).pipe(
      map(response => {
        if (!response.success || !response.user) throw new Error('Falha ao buscar usuário');
        const user = { ...response.user, credits: this.normalizeCredits(response.user.credits) };
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/request-password-reset`, { email }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return { message: response.message };
      }),
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/reset-password`, { token, password }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return { message: response.message };
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
    const enriched: any = new Error(message);
    // Preserva status e corpo para que os componentes possam exibir mensagens específicas
    enriched.status = error.status;
    enriched.error = error.error;
    return throwError(() => enriched);
  }
}
