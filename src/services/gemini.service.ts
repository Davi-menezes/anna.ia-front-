import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';
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

  constructor() { }

  async generateResponse(prompt: string): Promise<string> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean, content: string, credits: number }>(
          `${this.apiUrl}/gemini/chat`,
          { prompt }
        )
      );

      if (response && response.success) {
        // Update credits in UserService
        this.userService.credits.set(response.credits);
        return response.content;
      } else {
        throw new Error('Falha ao obter resposta do assistente');
      }
    } catch (e: any) {
      console.error(e);
      if (e.status === 403) {
        this.error.set('Créditos insuficientes para usar o chat.');
        this.userService.isOutOfCreditsModalOpen.set(true);
      } else {
        this.error.set('Houve um erro ao se comunicar com a IA. Tente novamente.');
      }
      return 'Desculpe, não consegui processar sua pergunta no momento.';
    } finally {
      this.loading.set(false);
    }
  }
}
