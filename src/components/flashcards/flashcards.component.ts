import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Flashcard } from '../../models/flashcard.model';
import { FlashcardsModalComponent } from './flashcards-modal.component';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule, FlashcardsModalComponent],
  templateUrl: './flashcards.component.html',
})
export class FlashcardsComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  apiUrl = `${environment.apiUrl}/flashcards`;
  enhancedApiUrl = `${environment.apiUrl}/flashcards-enhanced`;

  isLoading = signal(false);
  isGenerating = signal(false);
  error = signal<string | null>(null);
  showModal = signal(false);

  subjectFilter = signal<string>('');
  flashcards = signal<Flashcard[]>([]);

  front = signal('');
  back = signal('');
  subject = signal('');

  editingId = signal<string | null>(null);

  filtered = computed(() => {
    const s = this.subjectFilter().trim().toLowerCase();
    if (!s) return this.flashcards();
    return this.flashcards().filter(c => (c.subject || '').toLowerCase().includes(s));
  });

  constructor() {
    this.refresh();
    this.setupEventListeners();
  }

  private headers(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private setupEventListeners() {
    // Escutar eventos do modal
    window.addEventListener('closeFlashcardsModal', () => {
      this.showModal.set(false);
    });

    window.addEventListener('flashcardsGenerated', (event: any) => {
      const { flashcards } = event.detail;
      this.flashcards.set([...this.flashcards(), ...flashcards]);
    });
  }

  openModal() {
    this.showModal.set(true);
  }

  async refresh() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await lastValueFrom(
        this.http.get<{ success: boolean; data: Flashcard[] }>(this.apiUrl, { headers: this.headers() })
      );
      this.flashcards.set(res?.data || []);
    } catch (e: any) {
      this.error.set('Erro ao carregar flashcards.');
    } finally {
      this.isLoading.set(false);
    }
  }

  startEdit(card: Flashcard) {
    this.editingId.set(card.id);
    this.front.set(card.front);
    this.back.set(card.back);
    this.subject.set(card.subject || '');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.front.set('');
    this.back.set('');
    this.subject.set('');
  }

  async save() {
    this.error.set(null);
    const payload: any = {
      front: this.front().trim(),
      back: this.back().trim(),
      subject: this.subject().trim() || undefined,
    };

    if (!payload.front || !payload.back) {
      this.error.set('Preencha frente e verso.');
      return;
    }

    this.isLoading.set(true);
    try {
      const id = this.editingId();
      if (id) {
        await lastValueFrom(
          this.http.patch<{ success: boolean; data: Flashcard }>(`${this.apiUrl}/${id}`, payload, { headers: this.headers() })
        );
      } else {
        await lastValueFrom(
          this.http.post<{ success: boolean; data: Flashcard }>(this.apiUrl, payload, { headers: this.headers() })
        );
      }
      this.cancelEdit();
      await this.refresh();
    } catch (e: any) {
      this.error.set('Erro ao salvar flashcard.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async remove(card: Flashcard) {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await lastValueFrom(
        this.http.delete<{ success: boolean }>(`${this.apiUrl}/${card.id}`, { headers: this.headers() })
      );
      await this.refresh();
    } catch (e: any) {
      this.error.set('Erro ao deletar flashcard.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async review(card: Flashcard, quality: number) {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await lastValueFrom(
        this.http.post<{ success: boolean; data: Flashcard }>(`${this.apiUrl}/${card.id}/review`, { quality }, { headers: this.headers() })
      );
      await this.refresh();
    } catch (e: any) {
      this.error.set('Erro ao registrar revisão.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
