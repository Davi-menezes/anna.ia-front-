import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StudyPlanService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/study-plans`;

    async createPlan(data: any) {
        return firstValueFrom(this.http.post<any>(this.apiUrl, data));
    }

    async generateWeekly(planId: string) {
        return firstValueFrom(this.http.post<any>(`${this.apiUrl}/${planId}/generate`, {}));
    }

    async updatePerformance(planId: string, subjectName: string, performance: string) {
        return firstValueFrom(this.http.post<any>(`${this.apiUrl}/${planId}/performance`, { subjectName, performance }));
    }

    async getActivePlan() {
        return firstValueFrom(this.http.get<any>(this.apiUrl));
    }
}
