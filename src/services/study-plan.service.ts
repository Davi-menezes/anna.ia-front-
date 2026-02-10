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

  // Track active simulation session to avoid double charging
  private activeSimulationSession = {
    subject: null as string | null,
    isActive: false,
    questions: [] as Simulado[],
    currentIndex: 0,
    answers: {} as { [key: number]: number } // questionIndex -> answerIndex
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
    // Return cached questions if session is active for this subject
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
      if (response.success) {
        if (typeof response.credits === 'number') {
          this.userService.credits.set(response.credits);
        }
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
    // If there is an active session for this subject (or general if subject not provided but usually flow is per subject),
    // we skip the charge. ideally we should track subject.
    if (this.activeSimulationSession.isActive && this.activeSimulationSession.subject === subject) {
      return { success: true, credits: this.userService.credits() };
    }

    // Set the subject for the new session attempt
    if (subject) this.activeSimulationSession.subject = subject;

    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const response = await lastValueFrom(
      this.http.post<{ success: boolean; credits: number; freeTrialUsed?: boolean }>(`${this.apiUrl}/simulado/charge`, {}, { headers })
    );

    if (response.success) {
      this.activeSimulationSession.isActive = true; // Mark session as active
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