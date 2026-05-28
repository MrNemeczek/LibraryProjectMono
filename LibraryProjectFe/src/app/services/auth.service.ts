import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthenticationResponse,
  AuthenticatedUser,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'library_jwt_token';
  private readonly userKey = 'library_user';

  currentUser = signal<AuthenticatedUser | null>(this.getInitialUser());

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      '/api/auth/register',
      request
    );
  }

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>('/api/auth/login', request)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    this.clearSession();
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    if (token && this.isTokenValid(token)) {
      return true;
    }

    if (token) {
      this.clearSession();
    }

    return false;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.currentUser()?.role;
    return !!userRole && roles.includes(userRole);
  }

  private setSession(response: AuthenticationResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private getStoredUser(): AuthenticatedUser | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private getInitialUser(): AuthenticatedUser | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    if (!this.isTokenValid(token)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      return null;
    }

    return this.getStoredUser();
  }

  private isTokenValid(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  private decodeJwtPayload(token: string): { exp?: unknown } | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }
}
