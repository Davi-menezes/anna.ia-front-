
import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MarkdownModule, KatexOptions } from 'ngx-markdown';

import { ChatMessage } from '../../models/chat.model';
import { Simulado } from '../../models/simulado.model';
import { QUESTIONS_POOL } from '../../models/questions.data';
import { Vestibular } from '../../models/vestibular.model';
import { GeminiService } from '../../services/gemini.service';
import { UserService } from '../../services/user.service';
import { StudyPlanService } from '../../services/study-plan.service';
import { CreditsModalComponent } from '../credits-modal/credits-modal.component';
import { TiltDirective } from '../../directives/tilt.directive';
import { OnboardingModalComponent } from '../onboarding-modal/onboarding-modal.component';
import { QuestionGoalService } from '../../services/question-goal.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, CreditsModalComponent, RouterLink, TiltDirective, OnboardingModalComponent, MarkdownModule]
})
export class HomeComponent implements OnInit {
  geminiService = inject(GeminiService);
  userService = inject(UserService);
  studyPlanService = inject(StudyPlanService);
  questionGoalService = inject(QuestionGoalService);

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

  // Simulado Confirmation State
  showSimuladoConfirm = signal(false);
  simuladoToStart = signal<string | null>(null);

  katexOptions: KatexOptions = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ]
  };

  vestibulares = signal<Vestibular[]>([
    {
      acronym: 'ENEM',
      name: 'Exame Nacional do Ensino Médio',
      description: 'Principal porta de entrada para universidades públicas e privadas no Brasil.',
      registrationPeriod: 'Maio a Junho de 2026',
      examDates: ['Novembro de 2026'],
      officialSiteUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem'
    },
    {
      acronym: 'FUVEST',
      name: 'Fundação Universitária para o Vestibular',
      description: 'Processo seletivo para ingresso na Universidade de São Paulo (USP).',
      registrationPeriod: 'Agosto a Outubro de 2025 (para 2026)',
      examDates: ['Novembro de 2025', 'Dezembro de 2025'],
      officialSiteUrl: 'https://www.fuvest.br/'
    },
    {
      acronym: 'UNICAMP',
      name: 'Vestibular da Unicamp',
      description: 'Processo seletivo para a Universidade Estadual de Campinas.',
      registrationPeriod: 'Agosto a Setembro de 2025 (para 2026)',
      examDates: ['Outubro de 2025', 'Dezembro de 2025'],
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
    this.simuladoToStart.set(subject);

    if (this.studyPlanService.hasActiveSession(subject)) {
      this.confirmStartSimulado();
    } else {
      this.showSimuladoConfirm.set(true);
    }
  }

  cancelSimulado() {
    this.showSimuladoConfirm.set(false);
    this.simuladoToStart.set(null);
  }

  async confirmStartSimulado() {
    const subject = this.simuladoToStart();
    if (!subject) return;

    this.showSimuladoConfirm.set(false);
    this.selectedSubject.set(subject);
    this.isLoadingSimulado.set(true);
    this.simuladoError.set(null);
    this.currentExamQuestions.set([]);

    try {
      // 1. Charge for the simulado
      const chargeResult = await this.studyPlanService.chargeSimulado(subject);
      if (!chargeResult.success) {
        throw new Error('Falha na cobrança de créditos.');
      }

      // 2. Load questions
      // Check if resuming active session
      if (this.studyPlanService.hasActiveSession(subject)) {
        const session = this.studyPlanService.getSession();
        this.currentExamQuestions.set(session.questions);
        this.currentQuestionIndex.set(session.currentIndex);

        // Restore current answer if available
        const answer = session.answers[session.currentIndex] ?? null;
        this.selectedAnswer.set(answer);
      } else {
        // New Session
        let questions: Simulado[] = [];
        console.log(`confirmStartSimulado: Checking for subject "${subject}" in allQuestions:`, !!this.allQuestions[subject]);

        if (this.allQuestions[subject]) {
          console.log(`Using local questions for ${subject}`);
          const localQuestions = [...this.allQuestions[subject]];
          this.shuffleArray(localQuestions);
          questions = localQuestions.slice(0, 30).map((q, index) => ({
            ...q,
            id: index
          })) as Simulado[];
          console.log(`Loaded ${questions.length} local questions for ${subject}`);
        } else {
          console.log(`No local questions for ${subject}, calling API...`);
          questions = await this.studyPlanService.generateSimulado(subject);
          console.log(`API returned ${questions.length} questions for ${subject}`);
        }

        this.currentExamQuestions.set(questions);
        this.currentQuestionIndex.set(0);
        this.selectedAnswer.set(null);

        // Initialize Session in Service
        this.studyPlanService.startSession(subject, questions);
      }
    } catch (error: any) {
      if (error?.status === 403 || error?.error?.code === 'OUT_OF_CREDITS') {
        this.userService.isOutOfCreditsModalOpen.set(true);
        this.simuladoError.set('Créditos insuficientes para iniciar este simulado.');
        this.selectedSubject.set(null); // Close the exam modal if it opened
      } else {
        this.simuladoError.set(error.message || 'Erro desconhecido ao iniciar o simulado.');
      }
    } finally {
      this.isLoadingSimulado.set(false);
      this.simuladoToStart.set(null);
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

    // Track progress if correct
    const question = this.currentQuestion;

    // Save progress to session
    if (this.currentExamQuestions().length > 0) {
      this.studyPlanService.updateSessionProgress(this.currentQuestionIndex(), optionIndex);
    }

    if (question && optionIndex === question.correctAnswerIndex) {
      try {
        await this.questionGoalService.addProgress(1);
        // Emit event to notify other components (like question-goals) about the progress update
        window.dispatchEvent(new CustomEvent('questionGoalProgressUpdated', {
          detail: { completedQuestions: 1 }
        }));
      } catch (err) {
        console.error('Error updating question goal progress:', err);
      }
    }
  }

  nextQuestion() {
    const current = this.currentQuestionIndex();
    if (current < this.currentExamQuestions().length - 1) {
      this.currentQuestionIndex.set(current + 1);
      // Restore answer if already answered in session
      const session = this.studyPlanService.getSession();
      const nextAnswer = session.answers[current + 1] ?? null;
      this.selectedAnswer.set(nextAnswer);

      this.studyPlanService.updateSessionProgress(current + 1, nextAnswer);
    }
  }

  prevQuestion() {
    const current = this.currentQuestionIndex();
    if (current > 0) {
      this.currentQuestionIndex.set(current - 1);
      // Restore answer
      const session = this.studyPlanService.getSession();
      const prevAnswer = session.answers[current - 1] ?? null;
      this.selectedAnswer.set(prevAnswer);

      this.studyPlanService.updateSessionProgress(current - 1, prevAnswer);
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
