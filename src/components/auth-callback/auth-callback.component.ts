
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-futuristic-bg dark:bg-dark-bg text-futuristic-text dark:text-dark-text">
        <div class="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 dark:border-slate-700/50 text-center">
            <div class="w-12 h-12 border-4 border-futuristic-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 class="text-xl font-bold mb-2">Autenticando...</h2>
            <p class="text-futuristic-subtext dark:text-dark-subtext">Por favor, aguarde enquanto processamos seu login.</p>
        </div>
    </div>
  `,
    styles: []
})
export class AuthCallbackComponent implements OnInit {
    private authService = inject(AuthService);

    ngOnInit() {
        this.authService.handleGoogleCallback().subscribe();
    }
}
