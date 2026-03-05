
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  isLoggedIn = signal(false);
  user = signal<any>(null);
  isPremium = computed(() => this.user()?.status === 'premium');
  credits = signal(5);
  get maxCredits(): number {
    return this.isPremium() ? 500 : 5;
  }
  isOutOfCreditsModalOpen = signal(false);
  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Sincroniza o estado local com o AuthService
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn.set(!!user);
      this.user.set(user);
      if (user) {
        const n = typeof (user as any).credits === 'number' ? (user as any).credits : Number((user as any).credits);
        this.credits.set(Number.isFinite(n) ? n : 5);
      }
    });
  }

  // Obsoleto: autenticação tratada pelo AuthService
  login() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
  }

  async deductCredits(amount: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean, credits: number }>(
          `${this.apiUrl}/users/credits/deduct`,
          { amount }
        )
      );

      if (response && response.success) {
        this.credits.set(response.credits);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      if (error.status === 403) {
        this.isOutOfCreditsModalOpen.set(true);
      }
      return false;
    }
  }

  // Método legado local, substituído por deductCredits
  useCredit(cost: number = 0.25): boolean {
    if (this.credits() >= cost) {
      this.credits.update(c => Math.round(Math.max(0, c - cost) * 100) / 100);
      return true;
    }
    this.isOutOfCreditsModalOpen.set(true);
    return false;
  }

  addCredits(amount: number) {
    this.credits.update(c => c + amount);
  }

  rechargeCredits() {
    this.credits.set(this.maxCredits);
  }

  async updateProfile(data: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ success: boolean, user: any }>(
          `${this.apiUrl}/users/profile`,
          data
        )
      );
      if (response && response.success) {
        this.user.set(response.user);
        // Sincroniza o estado global de autenticação
        this.authService.fetchCurrentUser().subscribe();
        return response.user;
      }
      throw new Error('Falha ao atualizar perfil');
    } catch (error: any) {
      throw error;
    }
  }

  async updateProfilePicture(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean, user: any }>(
          `${this.apiUrl}/users/profile/picture`,
          formData
        )
      );
      if (response && response.success) {
        this.user.set(response.user);
        // Recarrega o estado completo do usuário para garantir consistência entre componentes
        this.authService.fetchCurrentUser().subscribe();
        return response.user;
      }
      throw new Error('Falha ao atualizar foto de perfil');
    } catch (error: any) {
      const message = error.error?.message || 'Erro ao atualizar foto de perfil.';
      throw new Error(message);
    }
  }

  closeOutOfCreditsModal() {
    this.isOutOfCreditsModalOpen.set(false);
  }

  getProfilePictureUrl(): string {
    const user = this.user();
    if (!user) return 'https://ui-avatars.com/api/?name=User&background=random';

    if (user.profilePicture) {
      // Endpoint de foto de perfil é público para permitir carregamento por tags <img>
      return `${this.apiUrl}/users/profile/picture/${user.id}?v=${new Date(user.updatedAt).getTime()}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  }
}
