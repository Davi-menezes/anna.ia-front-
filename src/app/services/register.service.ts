import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  constructor(private http: HttpClient) {}

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          // Mantém o formato original do erro HTTP para compatibilidade
          // Mas também adiciona o código diretamente no objeto de erro
          if (error.error && (error.error.message || error.error.code)) {
            // Preserva o erro original mas garante que o código esteja acessível
            const errorObj = {
              ...error,
              error: {
                ...error.error,
                code: error.error.code || 'UNKNOWN_ERROR',
                message: error.error.message || 'Erro ao processar o registro'
              },
              code: error.error.code || 'UNKNOWN_ERROR',
              message: error.error.message || 'Erro ao processar o registro'
            };
            return throwError(() => errorObj);
          }
          // Se for um erro de rede ou outro tipo de erro
          const networkError = {
            ...error,
            error: {
              message: 'Erro de conexão. Por favor, verifique sua conexão e tente novamente.',
              code: 'NETWORK_ERROR'
            },
            code: 'NETWORK_ERROR',
            message: 'Erro de conexão. Por favor, verifique sua conexão e tente novamente.'
          };
          return throwError(() => networkError);
        })
      );
  }
}
