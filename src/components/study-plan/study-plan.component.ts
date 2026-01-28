import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudyPlanService } from '../../services/study-plan.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../app/services/notification.service';

@Component({
    selector: 'app-study-plan',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './study-plan.component.html',
    styles: [`
    .step-active { @apply bg-futuristic-primary text-white; }
    .step-inactive { @apply bg-gray-200 dark:bg-slate-700 text-gray-500; }
  `]
})
export class StudyPlanComponent {
    studyPlanService = inject(StudyPlanService);
    userService = inject(UserService);
    router = inject(Router);
    notificationService = inject(NotificationService);

    step = signal(1);
    isLoading = signal(false);

    // Onboarding Data
    setupData = {
        targetVestibular: '',
        availableTimePerDay: 60,
        studyDays: [] as string[],
        subjects: [
            { name: 'Matemática', level: 3 },
            { name: 'Português', level: 3 },
            { name: 'História', level: 3 },
            { name: 'Geografia', level: 3 },
            { name: 'Biologia', level: 3 },
            { name: 'Química', level: 3 },
            { name: 'Física', level: 3 }
        ]
    };

    daysOfWeek = [
        { id: 'seg', name: 'Seg' },
        { id: 'ter', name: 'Ter' },
        { id: 'qua', name: 'Qua' },
        { id: 'qui', name: 'Qui' },
        { id: 'sex', name: 'Sex' },
        { id: 'sab', name: 'Sáb' },
        { id: 'dom', name: 'Dom' }
    ];

    activePlan = signal<any>(null);
    weeklySchedule = signal<any>(null);

    constructor() {
        if (!this.userService.isPremium()) {
            this.router.navigate(['/']);
        }
        this.loadActivePlan();
    }

    async loadActivePlan() {
        this.isLoading.set(true);
        try {
            const response = await this.studyPlanService.getActivePlan();
            if (response.data) {
                this.activePlan.set(response.data);
                if (response.data.activeSchedule) {
                    this.weeklySchedule.set(response.data.activeSchedule);
                    this.step.set(4);
                }
            }
        } catch (error) {
            console.error('Error loading active plan:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    toggleDay(dayId: string) {
        const index = this.setupData.studyDays.indexOf(dayId);
        if (index > -1) {
            this.setupData.studyDays.splice(index, 1);
        } else {
            this.setupData.studyDays.push(dayId);
        }
    }

    async finishSetup() {
        this.isLoading.set(true);
        try {
            const plan = await this.studyPlanService.createPlan(this.setupData);
            this.activePlan.set(plan.data);
            await this.generateSchedule();
            if (this.weeklySchedule()) {
                this.step.set(4); // Show dashboard
            }
        } catch (error: any) {
            console.error('Error setting up plan:', error);
            this.notificationService.showError(error.message || 'Erro ao criar plano de estudos.');
        } finally {
            this.isLoading.set(false);
        }
    }

    private async generateSchedule() {
        if (!this.activePlan()) return;
        this.isLoading.set(true);
        try {
            const schedule = await this.studyPlanService.generateWeekly(this.activePlan().id);
            this.weeklySchedule.set(schedule.data);
            this.notificationService.showSuccess('Plano de estudos gerado com sucesso! 🧠');
        } catch (error: any) {
            console.error('Error generating schedule:', error);
            this.notificationService.showError(error.message || 'Erro ao gerar cronograma semanal.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async updatePerformance(subjectName: string, perf: string) {
        if (!this.activePlan()) return;
        try {
            await this.studyPlanService.updatePerformance(this.activePlan().id, subjectName, perf);
            const messages: any = {
                'bad': 'Tudo bem recomeçar. Vou ajustar o foco para essa matéria no próximo mês! 💪',
                'average': 'Bom progresso! Continue insistindo que vai ficar fácil. 🚀',
                'good': 'Excelente! Você está dominando esse conteúdo. Orgulho! 🌟'
            };
            this.notificationService.showSuccess(messages[perf] || 'Feedback enviado!');
        } catch (error) {
            this.notificationService.showError('Erro ao atualizar desempenho.');
        }
    }

    getCurrentDayName() {
        const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
        return days[new Date().getDay()];
    }

    isCurrentDay(dayName: string) {
        const mapping: any = {
            'segunda': 'seg', 'terça': 'ter', 'quarta': 'qua', 'quinta': 'qui',
            'sexta': 'sex', 'sábado': 'sab', 'domingo': 'dom'
        };
        const current = this.getCurrentDayName();
        // The API returns 'segunda', 'terça', etc.
        return mapping[dayName.toLowerCase()] === current;
    }
}
