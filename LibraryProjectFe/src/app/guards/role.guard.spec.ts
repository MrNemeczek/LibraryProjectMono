import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  let authService: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    hasAnyRole: ReturnType<typeof vi.fn>;
  };
  let router: { parseUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn(), hasAnyRole: vi.fn() };
    router = { parseUrl: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should return true when logged in and has required role', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.hasAnyRole.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['Librarian', 'Administrator'])
    );
    expect(result).toBe(true);
  });

  it('should redirect to /books when logged in but wrong role', () => {
    const urlTree = new UrlTree();
    authService.isLoggedIn.mockReturnValue(true);
    authService.hasAnyRole.mockReturnValue(false);
    router.parseUrl.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['Administrator'])
    );
    expect(router.parseUrl).toHaveBeenCalledWith('/books');
    expect(result).toBe(urlTree);
  });

  it('should redirect to /books when not logged in', () => {
    const urlTree = new UrlTree();
    authService.isLoggedIn.mockReturnValue(false);
    router.parseUrl.mockReturnValue(urlTree);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['Librarian'])
    );
    expect(router.parseUrl).toHaveBeenCalledWith('/books');
    expect(result).toBe(urlTree);
  });
});
