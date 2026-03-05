import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { QuestionGoal } from '../models/question-goal.model';

@Injectable({
    providedIn: 'root'
})
export class QuestionGoalService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/question-goals`;

    // Estado compartilhado da meta do dia
    todayGoal = signal<QuestionGoal | null>(null);

    private headers(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    async getTodayGoal(): Promise<{ success: boolean; data: QuestionGoal }> {
        const res = await lastValueFrom(
            this.http.get<{ success: boolean; data: QuestionGoal }>(`${this.apiUrl}/today`, { headers: this.headers() })
        );
        this.todayGoal.set(res.data);
        return res;
    }

    async setTodayGoal(targetQuestions: number): Promise<{ success: boolean; data: QuestionGoal }> {
        return await lastValueFrom(
            this.http.post<{ success: boolean; data: QuestionGoal }>(`${this.apiUrl}/today`, { targetQuestions }, { headers: this.headers() })
        );
    }

    async addProgress(amount: number): Promise<{ success: boolean; data: QuestionGoal }> {
        const res = await lastValueFrom(
            this.http.put<{ success: boolean; data: QuestionGoal }>(`${this.apiUrl}/today`, { amount }, { headers: this.headers() })
        );
        this.todayGoal.set(res.data);
        return res;
    }
}
