import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { firstValueFrom, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private apiUrl = environment.apiUrl;

  loading = signal(false);
  error = signal<string | null>(null);

  // Configuração de retry
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_DELAY = 1500; // 1.5 segundos

  constructor() { }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async generateResponseWithRetry(
    prompt: string,
    history: { role: string, content: string }[],
    attempt: number = 0,
    imageBase64?: string,
    imageMimeType?: string,
  ): Promise<string> {
    try {
      const body: Record<string, unknown> = { prompt, history };
      if (imageBase64 && imageMimeType) {
        body['imageBase64'] = imageBase64;
        body['imageMimeType'] = imageMimeType;
      }

      const response = await firstValueFrom(
        this.http.post<{ success: boolean, content: string, credits: number }>(
          `${this.apiUrl}/gemini/chat`,
          body
        ).pipe(
          catchError(this.handleError)
        )
      );

      if (response && response.success) {
        this.userService.credits.set(response.credits);
        return response.content;
      } else {
        throw new Error('Falha ao obter resposta do assistente');
      }
    } catch (e: any) {
      // Verificar se é erro 429 e ainda temos tentativas
      const isRateLimit = e.status === 429 || e.code === 'RATE_LIMIT_EXCEEDED' || e.error?.code === 'RATE_LIMIT_EXCEEDED';

        if (isRateLimit && attempt < this.MAX_RETRIES) {
        const delay = this.INITIAL_DELAY * Math.pow(2, attempt);
        console.log(`Rate limit excedido. Tentando novamente em ${delay}ms (tentativa ${attempt + 1}/${this.MAX_RETRIES})`);

        const retryAfter = e.error?.retryAfter || e.headers?.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;

        await this.sleep(waitTime);
        return this.generateResponseWithRetry(prompt, history, attempt + 1, imageBase64, imageMimeType);
      }

      // Erro não recuperável ou sem tentativas
      if (e.status === 403) {
        this.error.set('Créditos insuficientes para usar o chat.');
        this.userService.isOutOfCreditsModalOpen.set(true);
      } else if (isRateLimit) {
        this.error.set('Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.');
      } else {
        this.error.set('Houve um erro ao se comunicar com a IA. Tente novamente.');
      }
      return 'Desculpe, não consegui processar sua pergunta no momento.';
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message;
    }

    console.error('Erro na requisição:', errorMessage, 'Status:', error.status);
    return throwError(() => ({ ...error, message: errorMessage }));
  }

  async generateResponse(
    prompt: string,
    history: { role: string, content: string }[] = [],
    imageBase64?: string,
    imageMimeType?: string,
  ): Promise<string> {
    this.loading.set(true);
    this.error.set(null);

    try {
      return await this.generateResponseWithRetry(prompt, history, 0, imageBase64, imageMimeType);
    } finally {
      this.loading.set(false);
    }
  }
}
