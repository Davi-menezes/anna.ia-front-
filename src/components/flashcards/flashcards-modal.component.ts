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
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-futuristic-text dark:text-dark-text">
              Gerar Flashcards Personalizados com IA
            </h2>
            <button (click)="closeModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            @for (i of flashcardIndices; track i) {
              <div class="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold text-futuristic-primary">Flashcard {{ i + 1 }}</span>
                  <span class="text-xs text-gray-500">(opcional - deixe vazio para aleatório)</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs text-gray-600 dark:text-gray-400">Matéria</label>
                    <input 
                      [ngModel]="getFlashcardSubject(i)" 
                      (ngModelChange)="setFlashcardSubject(i, $event)" 
                      placeholder="Ex: Matemática (ou deixe vazio)"
                      class="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 dark:text-gray-400">Tópico específico (opcional)</label>
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

          <div class="mt-6 flex items-center justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>Custo: 0.5 crédito para 10 flashcards</p>
              <p>Créditos restantes: {{ creditsRemaining() }}</p>
            </div>
            <div class="flex gap-3">
              <button 
                (click)="closeModal()" 
                class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-sm"
              >
                Cancelar
              </button>
              <button 
                (click)="generateFlashcards()" 
                [disabled]="isGenerating()"
                class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50 min-w-[200px]"
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

  async generateFlashcards() {
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
      this.error.set(e.error?.message || 'Erro ao gerar flashcards.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
