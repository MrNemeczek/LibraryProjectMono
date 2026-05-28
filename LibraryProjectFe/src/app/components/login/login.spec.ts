import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { AuthenticationResponse } from '../../models/auth.model';

function mockRouter() {
  return {
    navigate: vi.fn().mockResolvedValue(true),
    navigateByUrl: vi.fn().mockResolvedValue(true),
    createUrlTree: vi.fn(),
    serializeUrl: vi.fn().mockReturnValue(''),
    parseUrl: vi.fn(),
    isActive: vi.fn().mockReturnValue(false),
    url: '/',
    events: { subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }) },
    getCurrentNavigation: vi.fn(),
    routerState: { snapshot: { root: { component: null } as any } },
  } as unknown as Router;
}

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse: AuthenticationResponse = {
    token: 'token',
    expiresAt: '2026-12-31T23:59:59Z',
    user: { id: 1, firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', role: 'Reader' },
  };

  beforeEach(async () => {
    authService = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter() },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate email as required', () => {
      component.email.setValue('');
      expect(component.email.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.email.setValue('not-an-email');
      expect(component.email.hasError('email')).toBe(true);
    });

    it('should accept valid email', () => {
      component.email.setValue('test@example.com');
      expect(component.email.valid).toBe(true);
    });

    it('should validate password as required', () => {
      component.password.setValue('');
      expect(component.password.hasError('required')).toBe(true);
    });

    it('should accept valid password', () => {
      component.password.setValue('mypassword');
      expect(component.password.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not call service when form is invalid', () => {
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login and navigate on success', () => {
      component.form.patchValue({ email: 'jan@example.com', password: 'password123' });
      authService.login.mockReturnValue(of(mockResponse));
      component.onSubmit();
      expect(authService.login).toHaveBeenCalledWith({ email: 'jan@example.com', password: 'password123' });
      expect(router.navigate).toHaveBeenCalledWith(['/books']);
    });

    it('should show error message on failure', () => {
      component.form.patchValue({ email: 'jan@example.com', password: 'password123' });
      authService.login.mockReturnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
      component.onSubmit();
      expect(component.error).toBe('Invalid credentials');
      expect(component.loading).toBe(false);
    });

    it('should show default error message when no error detail', () => {
      component.form.patchValue({ email: 'jan@example.com', password: 'password123' });
      authService.login.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.error).toBe('Nieprawidłowy email lub hasło. Spróbuj ponownie.');
    });

    it('should set loading state', () => {
      component.form.patchValue({ email: 'jan@example.com', password: 'password123' });
      authService.login.mockReturnValue(of(mockResponse));
      component.onSubmit();
      expect(component.loading).toBe(true);
    });
  });
});
