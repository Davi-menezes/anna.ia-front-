
import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { ChatMessage } from '../../models/chat.model';
import { Simulado } from '../../models/simulado.model';
import { QUESTIONS_POOL } from '../../models/questions.data';
import { Vestibular } from '../../models/vestibular.model';
import { GeminiService } from '../../services/gemini.service';
import { UserService } from '../../services/user.service';
import { StudyPlanService } from '../../services/study-plan.service'; // Import StudyPlanService
import { CreditsModalComponent } from '../credits-modal/credits-modal.component';
import { TiltDirective } from '../../directives/tilt.directive';
import { OnboardingModalComponent } from '../onboarding-modal/onboarding-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, CreditsModalComponent, RouterLink, TiltDirective, OnboardingModalComponent]
})
export class HomeComponent implements OnInit {
  geminiService = inject(GeminiService);
  userService = inject(UserService);
  studyPlanService = inject(StudyPlanService); // Inject StudyPlanService

  userInput = signal('');
  messages = signal<ChatMessage[]>([]);
  hasStartedChat = computed(() => this.messages().length > 1);

  allQuestions = QUESTIONS_POOL;
  simulados = signal<Simulado[]>([]);

  // Exam Modal State
  selectedSubject = signal<string | null>(null);
  currentExamQuestions = signal<Simulado[]>([]);
  currentQuestionIndex = signal<number>(0);
  selectedAnswer = signal<number | null>(null);
  isLoadingSimulado = signal(false); // Loading state for simulado
  simuladoError = signal<string | null>(null);

  // Onboarding State
  showOnboarding = signal(false);

  vestibulares = signal<Vestibular[]>([
    {
      acronym: 'ENEM',
      name: 'Exame Nacional do Ensino Médio',
      description: 'Principal porta de entrada para universidades públicas e privadas no Brasil, utilizando a nota para o Sisu, Prouni e Fies.',
      registrationPeriod: '27 de Maio a 7 de Junho de 2024',
      examDates: ['3 de Novembro de 2024', '10 de Novembro de 2024'],
      officialSiteUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem'
    },
    {
      acronym: 'FUVEST',
      name: 'Fundação Universitária para o Vestibular',
      description: 'Processo seletivo para ingresso na Universidade de São Paulo (USP), um dos mais concorridos e prestigiados do país.',
      registrationPeriod: '19 de Agosto a 8 de Outubro de 2024',
      examDates: ['1ª fase: 17 de Novembro de 2024', '2ª fase: 15 e 16 de Dezembro de 2024'],
      officialSiteUrl: 'https://www.fuvest.br/'
    },
    {
      acronym: 'UNICAMP',
      name: 'Vestibular da Unicamp',
      description: 'Processo seletivo para a Universidade Estadual de Campinas (UNICAMP), conhecido por suas questões interdisciplinares e contextualizadas.',
      registrationPeriod: '1 de Agosto a 3 de Setembro de 2024',
      examDates: ['1ª fase: 20 de Outubro de 2024', '2ª fase: 1 e 2 de Dezembro de 2024'],
      officialSiteUrl: 'https://www.comvest.unicamp.br/'
    },
  ]);

  vestibularesPreview = computed(() => this.vestibulares().slice(0, 3));

  constructor(private router: Router) {
    // Initial greeting moved to ngOnInit to avoid signal issues
  }

  ngOnInit() {
    this.setGreeting();
    this.refreshQuestions();
    this.checkOnboarding();
  }

  checkOnboarding() {
    // Use a small timeout to ensure user data is loaded if it's coming from local storage/auth
    setTimeout(() => {
      if (this.userService.isLoggedIn()) {
        const u = this.userService.user();
        if (u && (!u.mainGoal || !u.education || !u.birthDate)) {
          this.showOnboarding.set(true);
        }
      }
    }, 1000);
  }

  onOnboardingCompleted() {
    this.showOnboarding.set(false);
  }

  setGreeting() {
    const hour = new Date().getHours();
    let timeGreeting = 'Olá';
    if (hour >= 5 && hour < 12) timeGreeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) timeGreeting = 'Boa tarde';
    else timeGreeting = 'Boa noite';

    if (this.messages().length === 0) {
      this.messages.set([
        { role: 'model', content: `${timeGreeting}! Como está o processo de estudos?` }
      ]);
    }
  }

  refreshQuestions() {
    if (!this.allQuestions) return;

    const subjects = Object.keys(this.allQuestions);
    const randomQuestions: Simulado[] = [];

    subjects.forEach((subject, index) => {
      const questions = this.allQuestions[subject];
      if (questions && questions.length > 0) {
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        randomQuestions.push({ id: index, ...randomQ });
      }
    });

    this.simulados.set(randomQuestions);
  }

  async sendMessage() {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const prompt = this.userInput().trim();
    if (!prompt) return;

    this.messages.update(msgs => [...msgs, { role: 'user', content: prompt }]);
    this.userInput.set('');

    const response = await this.geminiService.generateResponse(prompt, this.messages());
    this.messages.update(msgs => [...msgs, { role: 'model', content: response }]);
  }

  async openExam(subject: string) {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Backend charges the full simulado cost on generation (30 x 0.3 = 9 credits)
    if (this.userService.credits() < 9) { 
      this.userService.isOutOfCreditsModalOpen.set(true);
      return;
    }

    this.selectedSubject.set(subject);
    this.isLoadingSimulado.set(true);
    this.simuladoError.set(null);
    this.currentExamQuestions.set([]);

    try {
      const questions = await this.studyPlanService.generateSimulado(subject);
      this.currentExamQuestions.set(questions);
      this.currentQuestionIndex.set(0);
      this.selectedAnswer.set(null);
    } catch (error: any) {
      this.simuladoError.set(error.message || 'Erro desconhecido ao gerar o simulado.');
    } finally {
      this.isLoadingSimulado.set(false);
    }
  }

  closeExam() {
    this.selectedSubject.set(null);
    this.currentExamQuestions.set([]);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.isLoadingSimulado.set(false);
    this.simuladoError.set(null);
  }

  async submitAnswer(optionIndex: number) {
    if (this.selectedAnswer() !== null) return;

    this.selectedAnswer.set(optionIndex);
  }

  nextQuestion() {
    const current = this.currentQuestionIndex();
    if (current < this.currentExamQuestions().length - 1) {
      this.currentQuestionIndex.set(current + 1);
      this.selectedAnswer.set(null);
    }
  }

  prevQuestion() {
    const current = this.currentQuestionIndex();
    if (current > 0) {
      this.currentQuestionIndex.set(current - 1);
      this.selectedAnswer.set(null);
    }
  }

  get currentQuestion(): Simulado | undefined {
    return this.currentExamQuestions()[this.currentQuestionIndex()];
  }

  openPlans() {
    this.router.navigate(['/credits']);
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
