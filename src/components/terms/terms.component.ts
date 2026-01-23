import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen w-full bg-gradient-to-br from-futuristic-primary/5 to-futuristic-secondary/5 dark:from-slate-900 dark:to-slate-900 overflow-y-auto py-12 px-4">
      <div class="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-futuristic-primary to-futuristic-secondary p-8 text-white">
          <h1 class="text-3xl font-black mb-2">Termos e Condições</h1>
          <p class="text-white/80">Última atualização: Janeiro de 2026</p>
        </div>

        <div class="p-8 md:p-12 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">
          
          <!-- Seção 1 -->
          <section>
            <h2 class="text-xl font-bold text-futuristic-text dark:text-white mb-4 flex items-center">
              <span class="w-2 h-8 bg-futuristic-primary rounded-full mr-3"></span>
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar e utilizar a <strong>Anna.IA</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Esta plataforma é um assistente de estudos baseado em Inteligência Artificial, desenvolvido para auxiliar estudantes em sua jornada acadêmica.
            </p>
          </section>

          <!-- Seção 2 -->
          <section>
            <h2 class="text-xl font-bold text-futuristic-text dark:text-white mb-4 flex items-center">
              <span class="w-2 h-8 bg-futuristic-secondary rounded-full mr-3"></span>
              2. Uso da Inteligência Artificial
            </h2>
            <p class="mb-4">
              A Anna.IA utiliza tecnologias avançadas de IA (como o Google Gemini) para gerar Planos de Estudo e responder dúvidas. É importante notar que:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>As respostas são geradas automaticamente e podem conter imprecisões.</li>
              <li>Sugerimos sempre validar informações críticas em fontes oficiais de ensino.</li>
              <li>A ferramenta é um auxílio ao estudo, não substituindo o ensino formal ou professores.</li>
            </ul>
          </section>

          <!-- Seção 3 -->
          <section>
            <h2 class="text-xl font-bold text-futuristic-text dark:text-white mb-4 flex items-center">
              <span class="w-2 h-8 bg-futuristic-primary rounded-full mr-3"></span>
              3. Sistema de Créditos
            </h2>
            <p>
              O uso de funções específicas da IA consome créditos. Usuários gratuitos recebem uma quantidade inicial limitada. Créditos adicionais podem ser adquiridos ou liberados através de planos Premium. Créditos não são reembolsáveis após a utilização parcial do serviço.
            </p>
          </section>

          <!-- Seção 4 -->
          <section>
            <h2 class="text-xl font-bold text-futuristic-text dark:text-white mb-4 flex items-center">
              <span class="w-2 h-8 bg-futuristic-secondary rounded-full mr-3"></span>
              4. Privacidade e Dados
            </h2>
            <p class="mb-4">
              Sua privacidade é nossa prioridade. Coletamos apenas os dados necessários para o seu cadastro e personalização do plano de estudos (Nome, Email, Escolaridade e Objetivo).
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Dados de Estudo:</strong> São usados para que a IA personalize seu aprendizado.</li>
              <li><strong>Terceiros:</strong> Seus dados nunca são vendidos. Utilizamos serviços seguros de processamento de pagamentos (Mercado Pago) e autenticação (Google).</li>
              <li><strong>Cookies:</strong> Utilizamos cookies para manter sua sessão ativa e melhorar a experiência.</li>
            </ul>
          </section>

          <!-- Seção 5 -->
          <section>
            <h2 class="text-xl font-bold text-futuristic-text dark:text-white mb-4 flex items-center">
              <span class="w-2 h-8 bg-red-500 rounded-full mr-3"></span>
              5. Conduta do Usuário
            </h2>
            <p>
              É proibido utilizar a Anna.IA para gerar conteúdo ilegal, ofensivo ou para tentativas de fraude acadêmica. Reservamo-nos o direito de suspender contas que violem estas diretrizes.
            </p>
          </section>

          <!-- Footer Action -->
          <div class="pt-8 border-t border-gray-100 dark:border-slate-700 flex flex-col items-center">
            <p class="text-sm text-gray-500 mb-6 text-center">
              Ao continuar usando nossa plataforma, você confirma que leu e entendeu nossos termos.
            </p>
            <a routerLink="/register" class="inline-flex items-center justify-center py-4 px-10 rounded-2xl text-white bg-gradient-to-r from-futuristic-primary to-futuristic-secondary hover:opacity-90 transition-opacity font-bold shadow-xl shadow-futuristic-primary/20 transform active:scale-95">
              Entendi, voltar para o Registro
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class TermsComponent { }
