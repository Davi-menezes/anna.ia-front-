
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-onboarding-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div class="p-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-futuristic-text dark:text-dark-text mb-2">Bem-vindo à Anna.IA! 🚀</h2>
              <p class="text-futuristic-subtext dark:text-dark-subtext">Para personalizar sua experiência e criar o melhor plano de estudos para você, precisamos de algumas informações.</p>
            </div>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Data de Nascimento -->
                <div>
                  <label class="block font-medium text-futuristic-subtext dark:text-dark-subtext mb-2">Data de Nascimento</label>
                  <div class="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="DD" [(ngModel)]="day" min="1" max="31" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-futuristic-primary outline-none transition-all">
                    <input type="number" placeholder="MM" [(ngModel)]="month" min="1" max="12" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-futuristic-primary outline-none transition-all">
                    <input type="text" placeholder="YYYY" [(ngModel)]="year" (input)="limitYear($event)" inputmode="numeric" pattern="\\d{4}" maxlength="4" class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-futuristic-primary outline-none transition-all">
                  </div>
                </div>

                <!-- Escolaridade -->
                <div>
                  <label class="block font-medium text-futuristic-subtext dark:text-dark-subtext mb-2">Escolaridade Atual</label>
                  <select [(ngModel)]="formData.education" 
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-futuristic-primary outline-none transition-all">
                    <option value="" disabled selected>Selecione...</option>
                    <option value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</option>
                    <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
                    <option value="Ensino Médio em Andamento">Ensino Médio em Andamento</option>
                    <option value="Ensino Médio Completo">Ensino Médio Completo</option>
                    <option value="Cursando Pré-Vestibular">Cursando Pré-Vestibular</option>
                    <option value="Ensino Superior">Ensino Superior</option>
                  </select>
                </div>

                <!-- Localização -->
                <div class="md:col-span-2">
                  <label class="block font-medium text-futuristic-subtext dark:text-dark-subtext mb-2">Onde você mora? (Cidade/Estado)</label>
                  <input type="text" [(ngModel)]="formData.location" placeholder="Ex: São Paulo, SP"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-futuristic-primary outline-none transition-all">
                </div>

                <!-- Objetivo Principal -->
                <div class="md:col-span-2">
                  <label class="block font-medium text-futuristic-subtext dark:text-dark-subtext mb-2">Qual seu principal objetivo?</label>
                  <textarea [(ngModel)]="formData.mainGoal" placeholder="Ex: Passar em Medicina na USP, Melhorar minhas notas em Matemática..."
                    class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white h-32 focus:ring-2 focus:ring-futuristic-primary outline-none transition-all resize-none"></textarea>
                  <p class="text-xs text-gray-500 mt-1">Isso ajudará a Anna a focar nas suas prioridades.</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end pt-4">
                <button (click)="save()" [disabled]="isLoading() || !isValid()"
                  class="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-futuristic-primary to-futuristic-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  @if (isLoading()) { <i class="fas fa-spinner fa-spin mr-2"></i> }
                  Começar Jornada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OnboardingModalComponent {
  @Input() isOpen = false;
  @Output() completed = new EventEmitter<void>();

  userService = inject(UserService);
  isLoading = signal(false);

  day: number | null = null;
  month: number | null = null;
  year: number | null = null; // stores 4-digit year

  formData: Partial<User> = {
    education: '',
    location: '',
    mainGoal: ''
  };

  limitYear(event: Event) {
    const input = event.target as HTMLInputElement;
    // keep only digits and limit to 4 chars
    input.value = (input.value || '').replace(/[^0-9]/g, '').slice(0, 4);
    this.year = input.value ? Number(input.value) : null;
  }

  isValid(): boolean {
    const isDateValid = this.year && this.month && this.day && this.year > 1920 && this.year <= new Date().getFullYear() && this.month > 0 && this.month <= 12 && this.day > 0 && this.day <= 31;
    return !!(isDateValid && this.formData.education && this.formData.mainGoal);
  }

  async save() {
    if (!this.isValid()) return;

    this.isLoading.set(true);

    const month = this.month!.toString().padStart(2, '0');
    const day = this.day!.toString().padStart(2, '0');
    const birthDate = `${this.year}-${month}-${day}`;

    const dataToSave = { ...this.formData, birthDate };

    try {
      await this.userService.updateProfile(dataToSave);
      this.isLoading.set(false);
      this.completed.emit();
    } catch (err) {
      console.error('Error saving profile:', err);
      this.isLoading.set(false);
      alert('Erro ao salvar as informações. Tente novamente.');
    }
  }
}
