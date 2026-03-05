
import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, HostListener, ViewChild, ElementRef, NgZone } from '@angular/core';
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
  private ngZone = inject(NgZone);

  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;

  userInput = signal('');
  // messages vive no GeminiService para persistir entre navegações
  get messages() { return this.geminiService.messages; }
  hasStartedChat = computed(() => this.geminiService.messages().length > 1);

  // Imagem pendente para envio junto com a próxima mensagem
  pendingImageBase64 = signal<string | null>(null);
  pendingImageMime = signal<string>('image/jpeg');
  pendingImagePreview = signal<string | null>(null);

  // Índice da mensagem cujo conteúdo foi copiado (feedback visual temporário)
  copiedIndex = signal<number | null>(null);

  allQuestions = QUESTIONS_POOL;
  simulados = signal<Simulado[]>([]);

  // Estado do modal de prova/simulado
  selectedSubject = signal<string | null>(null);
  currentExamQuestions = signal<Simulado[]>([]);
  currentQuestionIndex = signal<number>(0);
  selectedAnswer = signal<number | null>(null);
  isLoadingSimulado = signal(false); // Estado de carregamento do simulado
  simuladoError = signal<string | null>(null);

  // Estado do onboarding
  showOnboarding = signal(false);

  // Estado do modal de confirmação do simulado
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
    // Saudação inicial movida para ngOnInit para evitar problemas com signals
  }

  ngOnInit() {
    this.setGreeting();
    this.refreshQuestions();
    this.checkOnboarding();
  }

  checkOnboarding() {
    // Pequeno delay para garantir que os dados do usuário já foram carregados do auth/localStorage
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
    this.geminiService.initGreeting();
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

  // Captura Ctrl+V / Cmd+V em qualquer lugar da página para colar imagens no chat
  @HostListener('paste', ['$event'])
  onGlobalPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.processImageFile(file);
          event.preventDefault();
        }
        break;
      }
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.processImageFile(file);
    input.value = '';
  }

  private processImageFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG, WEBP ou GIF.');
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      alert('A imagem é muito grande. O limite é 7 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      // Atualiza signals dentro da zona Angular para disparar change detection (OnPush)
      this.ngZone.run(() => {
        this.pendingImageBase64.set(base64);
        this.pendingImageMime.set(file.type);
        this.pendingImagePreview.set(dataUrl);
      });
    };
    reader.readAsDataURL(file);
  }

  clearPendingImage(): void {
    this.pendingImageBase64.set(null);
    this.pendingImagePreview.set(null);
  }

  copyMessage(content: string, index: number): void {
    // Remove marcação markdown simples para copiar texto limpo
    const plain = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ''))
      .replace(/#{1,6}\s/g, '')
      .trim();

    navigator.clipboard.writeText(plain).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    }).catch(() => {
      // Fallback para navegadores sem clipboard API
      const ta = document.createElement('textarea');
      ta.value = plain;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 60);
  }

  private isAskingForJustAnswer(text: string): boolean {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const patterns = [
      /me\s+d[ae]\s+s[oó]\s+a\s+(resposta|solucao|resultado)/,
      /s[oó]\s+(a\s+)?(resposta|solucao|resultado|gabarito)/,
      /sem\s+explicac[aã]o/,
      /nao\s+preciso\s+de\s+explicac[aã]o/,
      /pode\s+s[oó]\s+dar\s+a\s+resposta/,
      /s[oó]\s+me\s+(fala|diga|fale|diz)\s+a\s+(resposta|solucao|resultado)/,
      /qual\s+[eé]\s+a\s+resposta\s+s[oó]/,
      /me\s+da\s+a\s+solucao\s+logo/,
      /resposta\s+direta/,
      /v[aá]\s+direto\s+(ao|para\s+o)\s+ponto/
    ];
    return patterns.some(p => p.test(lower));
  }

  async sendMessage() {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const prompt = this.userInput().trim();
    const hasImage = !!this.pendingImageBase64();

    if (!prompt && !hasImage) return;

    // Bloqueia pedidos de "só a resposta" antes de gastar créditos
    if (prompt && this.isAskingForJustAnswer(prompt)) {
      this.messages.update(msgs => [
        ...msgs,
        { role: 'user', content: prompt },
        {
          role: 'model',
          content: 'Meu papel é te **ensinar**, não apenas fornecer respostas prontas! Isso não te ajudaria a aprender de verdade.\n\nVamos resolver juntos, passo a passo — assim você vai entender e conseguirá resolver sozinho nas próximas vezes. 💪\n\nMe conta o problema completo que eu te ajudo!'
        }
      ]);
      this.userInput.set('');
      this.clearPendingImage();
      return;
    }

    const imagePreview = this.pendingImagePreview();
    const imageBase64 = this.pendingImageBase64();
    const imageMime = this.pendingImageMime();

    this.messages.update(msgs => [
      ...msgs,
      { role: 'user', content: prompt || '📷 Imagem enviada', imageUrl: imagePreview ?? undefined }
    ]);
    this.userInput.set('');
    this.clearPendingImage();
    this.scrollToBottom();

    const response = await this.geminiService.generateResponse(
      prompt || 'Analise esta imagem e me ajude a entender o conteúdo educacional.',
      this.messages(),
      imageBase64 ?? undefined,
      imageMime
    );
    this.messages.update(msgs => [...msgs, { role: 'model', content: response }]);
    this.scrollToBottom();
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
      // 1. Realiza a cobrança de créditos
      const chargeResult = await this.studyPlanService.chargeSimulado(subject);
      if (!chargeResult.success) {
        throw new Error('Falha na cobrança de créditos.');
      }

      // 2. Carrega as questões
      // Verifica se está retomando uma sessão ativa
      if (this.studyPlanService.hasActiveSession(subject)) {
        const session = this.studyPlanService.getSession();
        this.currentExamQuestions.set(session.questions);
        this.currentQuestionIndex.set(session.currentIndex);

        // Restaura a resposta atual se já respondida na sessão
        const answer = session.answers[session.currentIndex] ?? null;
        this.selectedAnswer.set(answer);
      } else {
        // Nova sessão
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

        // Inicializa a sessão no serviço
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

    // Registra progresso se a resposta estiver correta
    const question = this.currentQuestion;

    // Salva progresso na sessão ativa
    if (this.currentExamQuestions().length > 0) {
      this.studyPlanService.updateSessionProgress(this.currentQuestionIndex(), optionIndex);
    }

    if (question && optionIndex === question.correctAnswerIndex) {
      try {
        await this.questionGoalService.addProgress(1);
        // Emite evento para notificar outros componentes (ex.: question-goals) sobre o progresso
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
      // Restaura resposta se já respondida na sessão
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
      // Restaura resposta da questão anterior
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
