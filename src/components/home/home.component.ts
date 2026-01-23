
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { ChatMessage } from '../../models/chat.model';
import { Simulado } from '../../models/simulado.model';
import { QUESTIONS_POOL } from '../../models/questions.data';
import { Vestibular } from '../../models/vestibular.model';
import { GeminiService } from '../../services/gemini.service';
import { UserService } from '../../services/user.service';
import { CreditsModalComponent } from '../credits-modal/credits-modal.component';
import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, CreditsModalComponent, RouterLink, TiltDirective]
})
export class HomeComponent {
  geminiService = inject(GeminiService);
  userService = inject(UserService);

  userInput = signal('');
  messages = signal<ChatMessage[]>([]);
  hasStartedChat = computed(() => this.messages().length > 1); // > 1 because 1 is the greeting

  // Use a map or object to store the pool, and a signal for the *current* display list
  allQuestions = QUESTIONS_POOL;
  simulados = signal<Simulado[]>([]);

  // Exam Modal State
  selectedSubject = signal<string | null>(null);
  currentExamQuestions = signal<Simulado[]>([]);
  currentQuestionIndex = signal<number>(0);
  selectedAnswer = signal<number | null>(null);

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
    this.setGreeting();
    this.refreshQuestions();
  }

  setGreeting() {
    const hour = new Date().getHours();
    let timeGreeting = 'Olá';
    if (hour >= 5 && hour < 12) timeGreeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) timeGreeting = 'Boa tarde';
    else timeGreeting = 'Boa noite';

    this.messages.set([
      { role: 'model', content: `${timeGreeting}! Como está o processo de estudos?` }
    ]);
  }

  refreshQuestions() {
    // Pick one random question from each subject for the dashboard cards
    const subjects = Object.keys(this.allQuestions);
    const randomQuestions: Simulado[] = subjects.map((subject, index) => {
      const questions = this.allQuestions[subject];
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      return { id: index, ...randomQ };
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

    // Credit deduction is now handled by the backend in GeminiService.
    // We update the local message list immediately for better UX.

    this.messages.update(msgs => [...msgs, { role: 'user', content: prompt }]);
    this.userInput.set('');

    const response = await this.geminiService.generateResponse(prompt);
    this.messages.update(msgs => [...msgs, { role: 'model', content: response }]);
  }

  openExam(subject: string) {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.userService.credits() < 0.3) {
      this.userService.isOutOfCreditsModalOpen.set(true);
      return;
    }
    this.selectedSubject.set(subject);

    // Load questions for this subject and shuffle them
    const questions = [...(this.allQuestions[subject] || [])];
    this.shuffleArray(questions);

    // Map to Simulado type (add IDs)
    const examQuestions: Simulado[] = questions.map((q, i) => ({ id: i, ...q }));

    this.currentExamQuestions.set(examQuestions);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
  }

  closeExam() {
    this.selectedSubject.set(null);
    this.currentExamQuestions.set([]);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
  }

  async submitAnswer(optionIndex: number) {
    if (this.selectedAnswer() !== null) return;

    // Deduct 0.3 credits for each simulation answer
    const success = await this.userService.deductCredits(0.3);
    if (!success) {
      return;
    }

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
      // We might want to save state if they go back, but simple version resets or keeps?
      // For simplicity, let's reset answer state when moving or we need an array of answers.
      // Current requirement: "mudar as questões todas as vezes que reinicia o site" -> implied persistent session not strict.
      // Let's reset for now to allow re-trying or just simple navigation.
      // Better ux: keep answers? That requires an array of user answers. 
      // Let's stick to simple: next/prev resets state for that question view if not implemented fully.
      // Actually, standard quiz: once answered, stay answered.
      // I will reset for simplicity as user just asked for "30 questions modal", not full quiz state engine.
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
