
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ChatMessage } from '../../models/chat.model';
import { Simulado } from '../../models/simulado.model';
import { Vestibular } from '../../models/vestibular.model';
import { GeminiService } from '../../services/gemini.service';
import { UserService } from '../../services/user.service';
import { CreditsModalComponent } from '../credits-modal/credits-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, CreditsModalComponent, RouterLink]
})
export class HomeComponent {
  geminiService = inject(GeminiService);
  userService = inject(UserService);

  userInput = signal('');
  messages = signal<ChatMessage[]>([
    { role: 'model', content: 'Olá! Como posso ajudar você a estudar hoje?' }
  ]);
  
  simulados = signal<Simulado[]>([
    { id: 1, subject: 'Matemática', question: 'Qual é o resultado de 7 x 8?', options: ['54', '56', '62', '64'], correctAnswerIndex: 1, explanation: '7 multiplicado por 8 resulta em 56. Esta é uma tabuada fundamental.' },
    { id: 2, subject: 'Português', question: 'Qual palavra é um substantivo próprio?', options: ['Cachorro', 'Cidade', 'Brasil', 'Amor'], correctAnswerIndex: 2, explanation: 'Brasil é um substantivo próprio pois nomeia um lugar específico (país).' },
    { id: 3, subject: 'Física', question: 'Qual é a fórmula da Segunda Lei de Newton?', options: ['E = mc²', 'V = R * i', 'S = So + v*t', 'F = m * a'], correctAnswerIndex: 3, explanation: 'A Segunda Lei de Newton, ou Princípio Fundamental da Dinâmica, estabelece que a força resultante (F) é igual ao produto da massa (m) pela aceleração (a).' },
    { id: 4, subject: 'História', question: 'Em que ano o Brasil se tornou independente?', options: ['1822', '1500', '1889', '1930'], correctAnswerIndex: 0, explanation: 'A Independência do Brasil foi proclamada em 7 de setembro de 1822 por Dom Pedro I.' },
  ]);
  
  selectedSimulado = signal<Simulado | null>(null);
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

  async sendMessage() {
    const prompt = this.userInput().trim();
    if (!prompt) return;

    if (!this.userService.useCredit()) {
        return; // Modal will be shown via credit check
    }

    this.messages.update(msgs => [...msgs, { role: 'user', content: prompt }]);
    this.userInput.set('');

    const response = await this.geminiService.generateResponse(prompt);
    this.messages.update(msgs => [...msgs, { role: 'model', content: response }]);
  }

  selectSimulado(simulado: Simulado) {
    if (this.userService.credits() <= 0) {
        this.userService.isOutOfCreditsModalOpen.set(true);
        return;
    }
    this.selectedSimulado.set(simulado);
    this.selectedAnswer.set(null);
  }

  submitAnswer(optionIndex: number) {
    if (this.selectedAnswer() !== null) return;

    if (!this.userService.useCredit()) {
        return; // Modal will be shown
    }
    
    this.selectedAnswer.set(optionIndex);
  }
}
