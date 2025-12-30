
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  isLoggedIn = signal(false);
  credits = signal(5);
  maxCredits = 5;
  isOutOfCreditsModalOpen = signal(false);

  constructor(private router: Router) {}

  login() {
    this.isLoggedIn.set(true);
    this.router.navigate(['/profile']);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
  
  useCredit(): boolean {
    if (this.credits() > 0) {
      this.credits.update(c => c - 1);
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

  closeOutOfCreditsModal() {
    this.isOutOfCreditsModalOpen.set(false);
  }
}
