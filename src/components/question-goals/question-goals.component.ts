import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { QuestionGoal } from '../../models/question-goal.model';
import { QuestionGoalService } from '../../services/question-goal.service';

interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-question-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-goals.component.html',
})
export class QuestionGoalsComponent {
  private questionGoalService = inject(QuestionGoalService);

  apiUrl = `${environment.apiUrl}/question-goals`;
  studyGoalsApiUrl = `${environment.apiUrl}/study-goals`;

  isLoading = signal(false);
  error = signal<string | null>(null);

  goal = signal<QuestionGoal | null>(null);
  targetInput = signal<number>(0);

  // Para o TODO List de Metas de Estudo
  studyGoals = signal<StudyGoal[]>([]);
  newGoalTitle = signal('');
  newGoalDescription = signal('');
  editingGoalId = signal<string | null>(null);

  progressPct = computed(() => {
    const g = this.goal();
    if (!g) return 0;
    if (!g.targetQuestions) return 0;
    return Math.min((g.completedQuestions / g.targetQuestions) * 100, 100);
  });

  progressText = computed(() => {
    const g = this.goal();
    if (!g) return '0/0';
    return `${g.targetQuestions}/${g.completedQuestions}`;
  });

  constructor() {
    this.refresh();
    this.loadStudyGoals();
  }


  async refresh() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await this.questionGoalService.getTodayGoal();
      this.goal.set(res.data);
      this.targetInput.set(res.data.targetQuestions || 0);
    } catch (e: any) {
      this.error.set('Erro ao carregar meta do dia.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadStudyGoals() {
    try {
      // Simular carregamento de metas de estudo (implementação local)
      const storedGoals = localStorage.getItem('studyGoals');
      if (storedGoals) {
        this.studyGoals.set(JSON.parse(storedGoals));
      }
    } catch (e: any) {
      console.error('Erro ao carregar metas de estudo:', e);
    }
  }

  async saveStudyGoals() {
    try {
      localStorage.setItem('studyGoals', JSON.stringify(this.studyGoals()));
    } catch (e: any) {
      console.error('Erro ao salvar metas de estudo:', e);
    }
  }

  async saveTarget() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const targetQuestions = Number(this.targetInput());
      const res = await this.questionGoalService.setTodayGoal(targetQuestions);
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
      const res = await this.questionGoalService.addProgress(amount);
      this.goal.set(res.data);
    } catch (e: any) {
      this.error.set('Erro ao atualizar progresso.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Métodos para o TODO List de Metas de Estudo
  addNewGoal() {
    const title = this.newGoalTitle().trim();
    if (!title) return;

    const newGoal: StudyGoal = {
      id: Date.now().toString(),
      title,
      description: this.newGoalDescription().trim() || undefined,
      completed: false,
      createdAt: new Date()
    };

    this.studyGoals.set([...this.studyGoals(), newGoal]);
    this.saveStudyGoals();

    // Limpar formulário
    this.newGoalTitle.set('');
    this.newGoalDescription.set('');
  }

  editGoal(goal: StudyGoal) {
    this.editingGoalId.set(goal.id);
    this.newGoalTitle.set(goal.title);
    this.newGoalDescription.set(goal.description || '');
  }

  async updateGoal(goal: StudyGoal) {
    if (this.editingGoalId() === goal.id) {
      // Salvar edição
      const updatedGoals = this.studyGoals().map(g =>
        g.id === goal.id
          ? { ...g, title: this.newGoalTitle(), description: this.newGoalDescription() || undefined }
          : g
      );
      this.studyGoals.set(updatedGoals);
      this.saveStudyGoals();

      // Limpar edição
      this.editingGoalId.set(null);
      this.newGoalTitle.set('');
      this.newGoalDescription.set('');
    } else {
      // Toggle completion
      const updatedGoals = this.studyGoals().map(g =>
        g.id === goal.id ? { ...g, completed: !g.completed } : g
      );
      this.studyGoals.set(updatedGoals);
      this.saveStudyGoals();
    }
  }

  updateGoalStatus(goal: StudyGoal) {
    const updatedGoals = this.studyGoals().map(g =>
      g.id === goal.id ? { ...g, completed: !g.completed } : g
    );
    this.studyGoals.set(updatedGoals);
    this.saveStudyGoals();

    // Se a meta foi marcada como concluída, adicionar 1 ao progresso de questões
    if (!goal.completed) {
      this.addProgress(1);
    }
  }

  deleteGoal(goalId: string) {
    const updatedGoals = this.studyGoals().filter(g => g.id !== goalId);
    this.studyGoals.set(updatedGoals);
    this.saveStudyGoals();
  }
}
