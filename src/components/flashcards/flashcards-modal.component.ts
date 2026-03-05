import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Flashcard } from '../../models/flashcard.model';

interface FlashcardRequest {
  subject: string;
  front?: string;
  topic?: string; // Mapped from front in UI for convenience
}

@Component({
  selector: 'app-flashcards-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div class="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto">
        <div class="p-4 sm:p-6">
          <!-- Barra de arrasto visual no mobile -->
          <div class="flex justify-center mb-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></div>
          </div>

          <div class="flex items-start justify-between mb-5 gap-3">
            <h2 class="text-base sm:text-xl font-bold text-futuristic-text dark:text-dark-text leading-snug">
              Gerar Flashcards com IA
            </h2>
            <button (click)="closeModal()" class="shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-3">
            @for (i of flashcardIndices; track i) {
              <div class="p-3 sm:p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold text-futuristic-primary">Flashcard {{ i + 1 }}</span>
                  <span class="text-xs text-gray-400 hidden sm:inline">(opcional)</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label class="text-xs text-gray-600 dark:text-gray-400">Matéria</label>
                    <input 
                      [ngModel]="getFlashcardSubject(i)" 
                      (ngModelChange)="setFlashcardSubject(i, $event)" 
                      placeholder="Ex: Matemática"
                      class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 dark:text-gray-400">Tópico (opcional)</label>
                    <input 
                      [ngModel]="getFlashcardFront(i)" 
                      (ngModelChange)="setFlashcardFront(i, $event)" 
                      placeholder="Ex: Cálculo integral"
                      class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Rodapé: empilhado no mobile, lado a lado no desktop -->
          <div class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <p>Custo: 0,5 crédito • Créditos: <strong>{{ creditsRemaining() }}</strong></p>
            </div>
            <div class="flex gap-2">
              <button 
                (click)="closeModal()" 
                class="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 text-sm"
              >
                Cancelar
              </button>
              <button 
                (click)="generateFlashcards()" 
                [disabled]="isGenerating()"
                class="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                @if (isGenerating()) { 
                  <span class="flex items-center gap-2 justify-center">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gerando...
                  </span> 
                } @else { 
                  {{ generateButtonText() }}
                }
              </button>
            </div>
          </div>

          @if (error()) {
            <div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
            </div>
          }

          @if (success()) {
            <div class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">{{ success() }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class FlashcardsModalComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  enhancedApiUrl = `${environment.apiUrl}/flashcards-enhanced`;

  isGenerating = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  creditsRemaining = signal(0);

  flashcardRequests = signal<FlashcardRequest[]>(
    Array.from({ length: 10 }, () => ({ subject: '', front: '' }))
  );

  flashcardIndices = Array.from({ length: 10 }, (_, i) => i);

  constructor() {
    this.loadUserCredits();
  }

  private headers(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async loadUserCredits() {
    try {
      const res = await lastValueFrom(
        this.http.get<{ success: boolean; user: any }>(`${environment.apiUrl}/auth/me`, { headers: this.headers() })
      );
      this.creditsRemaining.set(res.user?.credits ?? 0);
    } catch (e) {
      console.error('Erro ao carregar créditos:', e);
    }
  }

  hasValidSubjects(): boolean {
    return this.flashcardRequests().some(req => req.subject.trim().length > 0);
  }

  generateButtonText(): string {
    const validCount = this.flashcardRequests().filter(req => req.subject.trim().length > 0).length;
    if (validCount === 0) {
      return 'Gerar Flashcards Aleatórios';
    }
    return 'Gerar Flashcards';
  }

  // Métodos para acesso seguro aos flashcards no template
  getFlashcardSubject(index: number): string {
    const requests = this.flashcardRequests();
    return requests[index]?.subject || '';
  }

  setFlashcardSubject(index: number, value: string): void {
    const requests = this.flashcardRequests();
    if (!requests[index]) {
      requests[index] = { subject: '', front: '' };
    }
    requests[index].subject = value;
    this.flashcardRequests.set([...requests]);
  }

  getFlashcardFront(index: number): string {
    const requests = this.flashcardRequests();
    return requests[index]?.front || '';
  }

  setFlashcardFront(index: number, value: string): void {
    const requests = this.flashcardRequests();
    if (!requests[index]) {
      requests[index] = { subject: '', front: '' };
    }
    requests[index].front = value; // Na verdade é o tópico
    this.flashcardRequests.set([...requests]);
  }

  closeModal() {
    const event = new CustomEvent('closeFlashcardsModal');
    window.dispatchEvent(event);
  }

  // Configuração de retry
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_DELAY = 2000; // 2 segundos

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateFlashcards() {
    await this.generateFlashcardsWithRetry(0);
  }

  private async generateFlashcardsWithRetry(attempt: number) {
    this.isGenerating.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const allRequests = this.flashcardRequests();

      // Preparar payload para o backend
      // Mapeamos 'front' do frontend para 'topic' do backend, pois o campo 'front' na UI é usado como Tópico Específico
      const payloadRequests = allRequests.map(req => ({
        subject: req.subject.trim(), // Se vazio, backend trata como aleatório
        topic: req.front?.trim() // Se vazio, ignorado
      }));

      const res = await lastValueFrom(
        this.http.post<{ success: boolean; data: any }>(
          `${this.enhancedApiUrl}/generate`,
          {
            flashcardRequests: payloadRequests
          },
          { headers: this.headers() }
        )
      );

      if (res.success && res.data.flashcards) {
        this.success.set(`${res.data.flashcards.length} flashcards gerados com sucesso!`);
        this.creditsRemaining.set(res.data.creditsRemaining);

        // Emitir evento com os flashcards gerados
        const event = new CustomEvent('flashcardsGenerated', {
          detail: { flashcards: res.data.flashcards }
        });
        window.dispatchEvent(event);

        setTimeout(() => this.closeModal(), 2000);
      } else {
        this.error.set('Nenhum flashcard foi gerado.');
      }

    } catch (e: any) {
      // Verifica tipos de erro específicos da resposta
      const status = e.status;
      const errorData = e.error;

      // Verificar se é erro 429 (rate limit ou quota) e ainda temos tentativas
      const isRateLimit = status === 429 ||
        errorData?.code === 'GEMINI_QUOTA_EXCEEDED' ||
        errorData?.code === 'RATE_LIMIT_EXCEEDED';

      if (isRateLimit && attempt < this.MAX_RETRIES) {
        const delay = this.INITIAL_DELAY * Math.pow(1.5, attempt); // Backoff
        console.log(`Rate limit excedido. Tentando novamente em ${delay}ms (tentativa ${attempt + 1}/${this.MAX_RETRIES})`);

        // Verificar se há retryAfter do backend
        const retryAfter = errorData?.retryAfter || Math.ceil(delay / 1000);

        this.isGenerating.set(true); // Manter loading
        this.error.set(`Alta demanda no serviço de IA. Reajustando e tentando novamente em ${retryAfter}s... (tentativa ${attempt + 1}/${this.MAX_RETRIES})`);

        await this.sleep(retryAfter * 1000);
        return this.generateFlashcardsWithRetry(attempt + 1);
      }

      // Erro não recuperável ou sem tentativas restantes
      if (isRateLimit) {
        this.error.set('Muitas requisições. Por favor, aguarde alguns segundos e tente novamente.');
      } else if (status === 429 || errorData?.code === 'GEMINI_QUOTA_EXCEEDED') {
        const retryAfter = errorData?.retryAfter || 60;
        this.error.set(`Serviço de IA temporariamente indisponível. Por favor, tente novamente em ${retryAfter} segundos.`);
      } else if (status === 503 || errorData?.message?.includes('indisponível')) {
        this.error.set('Serviço de IA temporariamente indisponível. Tente novamente mais tarde.');
      } else {
        this.error.set(errorData?.message || 'Erro ao gerar flashcards.');
      }
    } finally {
      this.isGenerating.set(false);
    }
  }
}
