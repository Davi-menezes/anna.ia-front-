import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Simulado } from '../models/simulado.model';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/study-plans`;

  async getActivePlan(): Promise<{ success: boolean; data: any }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}`, { headers }));
  }

  async createPlan(payload: any): Promise<{ success: boolean; data: any }>{
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}`, payload, { headers }));
  }

  async generateWeekly(planId: string): Promise<{ success: boolean; data: any }>{
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/${planId}/generate`, {}, { headers }));
  }

  async updatePerformance(planId: string, subjectName: string, performance: 'good' | 'average' | 'bad'): Promise<{ success: boolean }>{
    const token = this.authService.getToken();
    if (!token) throw new Error('Não autenticado');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return await lastValueFrom(this.http.post<{ success: boolean }>(`${this.apiUrl}/${planId}/performance`, { subjectName, performance }, { headers }));
  }

  async generateSimulado(subject: string): Promise<Simulado[]> {
    const token = this.authService.getToken();
    if (!token) {
      // Or handle error more gracefully
      throw new Error('Não autenticado');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      const response = await lastValueFrom(
        this.http.get<{ success: boolean, data: Simulado[], credits?: number }>(`${this.apiUrl}/simulado/${subject}`, { headers })
      );
      if (response.success) {
        // If backend returns updated credits, let UserService reflect it via AuthService current user
        // intentionally not mutating auth state here; credits can be refreshed via /auth/me
        return response.data;
      } else {
        throw new Error('Falha ao gerar simulado.');
      }
    } catch (error) {
      console.error('Error generating simulado:', error);
      // Let the component handle the error display
      throw error;
    }
  }
}