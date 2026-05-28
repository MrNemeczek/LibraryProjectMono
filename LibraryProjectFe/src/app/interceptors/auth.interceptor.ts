import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const TOKEN_KEY = 'library_jwt_token';
const USER_KEY = 'library_user';
const AUTH_PATHS = ['/api/auth/login', '/api/auth/register'];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(TOKEN_KEY);
    const isAuthRequest = AUTH_PATHS.some((path) => req.url.startsWith(path));

    if (!isAuthRequest && token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
        }
        return throwError(() => error);
      })
    );
  }
}
