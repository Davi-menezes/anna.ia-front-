import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { QuestionGoal } from '../../models/question-goal.model';

@Component({
  selector: 'app-question-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-goals.component.html',
})
export class QuestionGoalsComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  apiUrl = `${environment.apiUrl}/question-goals`;

  isLoading = signal(false);
  error = signal<string | null>(null);

  goal = signal<QuestionGoal | null>(null);
  targetInput = signal<number>(0);

  progressPct = computed(() => {
    const g = this.goal();
    if (!g) return 0;
    if (!g.targetQuestions) return 0;
    return Math.min((g.completedQuestions / g.targetQuestions) * 100, 100);
  });

  progressText = computed(() => {
    const g = this.goal();
    if (!g) return '0/0';
    return `${g.completedQuestions}/${g.targetQuestions}`;
  });

  constructor() {
    this.refresh();
  }

  private headers(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async refresh() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await lastValueFrom(
        this.http.get<{ success: boolean; data: QuestionGoal }>(`${this.apiUrl}/today`, { headers: this.headers() })
      );
      this.goal.set(res.data);
      this.targetInput.set(res.data.targetQuestions || 0);
    } catch (e: any) {
      this.error.set('Erro ao carregar meta do dia.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveTarget() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const targetQuestions = Number(this.targetInput());
      const res = await lastValueFrom(
        this.http.post<{ success: boolean; data: QuestionGoal }>(`${this.apiUrl}/today`, { targetQuestions }, { headers: this.headers() })
      );
      this.goal.set(res.data);
    } catch (e: any) {
      this.error.set('Erro ao salvar meta.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addProgress(amount: number) {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await lastValueFrom(
        this.http.post<{ success: boolean; data: QuestionGoal }>(`${this.apiUrl}/today/progress`, { amount }, { headers: this.headers() })
      );
      this.goal.set(res.data);
    } catch (e: any) {
      this.error.set('Erro ao atualizar progresso.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
