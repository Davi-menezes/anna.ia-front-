import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Simulado } from '../models/simulado.model';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private apiUrl = `${environment.apiUrl}/study-plans`;

  // Controla a sessão de simulado ativa para evitar cobrança dupla
  private activeSimulationSession = {
    subject: null as string | null,
    isActive: false,
    questions: [] as Simulado[],
    currentIndex: 0,
    answers: {} as { [key: number]: number } // índice da questão -> índice da resposta
  };

  constructor() {
    this.loadSession();
  }

  private saveSession() {
    localStorage.setItem('anna_simulation_session', JSON.stringify(this.activeSimulationSession));
  }

  private loadSession() {
    const saved = localStorage.getItem('anna_simulation_session');
    if (saved) {
      try {
        this.activeSimulationSession = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load session', e);
      }
    }
  }

  hasActiveSession(subject: string): boolean {
    return this.activeSimulationSession.isActive && this.activeSimulationSession.subject === subject;
  }

  getSession() {
    return this.activeSimulationSession;
  }

  startSession(subject: string, questions: Simulado[]) {
    this.activeSimulationSession = {
      subject,
      isActive: true,
      questions,
      currentIndex: 0,
      answers: {}
    };
    this.saveSession();
  }

  updateSessionProgress(index: number, answerIndex: number | null) {
    this.activeSimulationSession.currentIndex = index;
    if (answerIndex !== null) {
      this.activeSimulationSession.answers[index] = answerIndex;
    }
    this.saveSession();
  }

  clearSession() {
    this.activeSimulationSession = {
      subject: null,
      isActive: false,
      questions: [],
      currentIndex: 0,
      answers: {}
    };
    localStorage.removeItem('anna_simulation_session');
  }

  async getActivePlan(): Promise<{ success: boolean; data: any }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}`, { headers }));
  }

  async createPlan(payload: any): Promise<{ success: boolean; data: any }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}`, payload, { headers }));
  }

  async generateWeekly(planId: string): Promise<{ success: boolean; data: any }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/${planId}/generate`, {}, { headers }));
  }

  async updatePerformance(planId: string, subjectName: string, performance: string): Promise<{ success: boolean }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<{ success: boolean }>(`${this.apiUrl}/${planId}/performance`, { subjectName, performance }, { headers }));
  }

  async generateSimulado(subject: string): Promise<Simulado[]> {
    // Retorna questões em cache se já houver sessão ativa para essa matéria
    if (this.hasActiveSession(subject)) {
      return this.activeSimulationSession.questions;
    }

    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Não autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      const response = await lastValueFrom(
        this.http.get<{ success: boolean, data: Simulado[], credits?: number }>(`${this.apiUrl}/simulado/${subject}`, { headers })
      );
      console.log('generateSimulado response:', response);
      if (response.success) {
        if (typeof response.credits === 'number') {
          this.userService.credits.set(response.credits);
        }
        console.log('Questions received:', response.data?.length);
        return response.data;
      } else {
        throw new Error('Falha ao gerar simulado.');
      }
    } catch (error) {
      console.error('Error generating simulado:', error);
      throw error;
    }
  }

  async chargeSimulado(subject?: string): Promise<{ success: boolean; credits: number; freeTrialUsed?: boolean }> {
    // Se já existe sessão ativa para essa matéria, pula a cobrança
    if (this.activeSimulationSession.isActive && this.activeSimulationSession.subject === subject) {
      return { success: true, credits: this.userService.credits() };
    }

    // Define a matéria para a nova tentativa de sessão
    if (subject) this.activeSimulationSession.subject = subject;

    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const response = await lastValueFrom(
      this.http.post<{ success: boolean; credits: number; freeTrialUsed?: boolean }>(`${this.apiUrl}/simulado/charge`, {}, { headers })
    );

    if (response.success) {
      // NÃO ativa a sessão aqui — só fica ativa após carregar as questões via startSession()
      this.userService.credits.set(response.credits);
      if (response.freeTrialUsed) {
        const currentUser = this.userService.user();
        if (currentUser) {
          this.userService.user.set({ ...currentUser, freeSimuladoUsed: true } as any);
        }
      }
    }
    return response;
  }
}