import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const token = localStorage.getItem('token');

    if (token) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(cloned).pipe(
            catchError(error => {
                if (error.status === 401) {
                    // Token expired or invalid
                    authService.logout();
                    router.navigate(['/login']);
                }
                return throwError(error);
            })
        );
    }

    return next(req);
};
