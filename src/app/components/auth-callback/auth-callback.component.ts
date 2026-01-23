import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '<p>Processando autenticação...</p>',
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.2rem;
      color: #666;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.handleGoogleCallback().subscribe();
  }
}
