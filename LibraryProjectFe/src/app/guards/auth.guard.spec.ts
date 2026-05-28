import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: { isLoggedIn: ReturnType<typeof vi.fn> };
  let router: { parseUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn() };
    router = { parseUrl: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should return true when user is logged in', () => {
    authService.isLoggedIn.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(authGuard);
    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not logged in', () => {
    const urlTree = new UrlTree();
    authService.isLoggedIn.mockReturnValue(false);
    router.parseUrl.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(authGuard);
    expect(router.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBe(urlTree);
  });
});
