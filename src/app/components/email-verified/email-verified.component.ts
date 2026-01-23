import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-email-verified',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-futuristic-primary/10 to-futuristic-secondary/10 dark:from-slate-900/50 dark:to-slate-800/50 overflow-hidden relative">
      <!-- Background Effects -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-futuristic-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-futuristic-secondary/20 rounded-full blur-3xl animate-pulse"></div>

      <div class="w-full max-w-md relative z-10 text-center">
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 dark:border-slate-700/50 p-8 sm:p-10">
          <!-- Success Indicator -->
          <div class="flex justify-center mb-6">
            <div class="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
              <svg class="h-14 w-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 class="text-3xl font-extrabold text-futuristic-text dark:text-white mb-4">
            E-mail Verificado!
          </h2>
          <p class="text-futuristic-subtext dark:text-slate-400 mb-8 max-w-xs mx-auto">
            Sua conta Anna.IA foi ativada com sucesso. Você está pronto para decolar em seus estudos!
          </p>
          
          <div class="space-y-4">
            <a 
              [routerLink]="['/login']"
              class="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-futuristic-primary hover:bg-futuristic-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-futuristic-primary transition-all duration-300 transform hover:-translate-y-1"
            >
              <span>Ir para tela inicial</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            
            <p class="text-xs text-futuristic-subtext dark:text-slate-500">
              Caso não seja redirecionado, clique no botão acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EmailVerifiedComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Opcional: Adicionar lógica adicional se necessário
  }
}
