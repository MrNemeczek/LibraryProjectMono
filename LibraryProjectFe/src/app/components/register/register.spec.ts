import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Register } from './register';
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

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authService: { register: ReturnType<typeof vi.fn> };
  let router: Router;

  const mockResponse: AuthenticationResponse = {
    token: 'token',
    expiresAt: '2026-12-31T23:59:59Z',
    user: { id: 1, firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', role: 'Reader' },
  };

  beforeEach(async () => {
    authService = { register: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter() },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate firstName as required', () => {
      component.firstName.setValue('');
      expect(component.firstName.hasError('required')).toBe(true);
    });

    it('should validate lastName as required', () => {
      component.lastName.setValue('');
      expect(component.lastName.hasError('required')).toBe(true);
    });

    it('should validate email as required and check format', () => {
      component.email.setValue('');
      expect(component.email.hasError('required')).toBe(true);
      component.email.setValue('bad');
      expect(component.email.hasError('email')).toBe(true);
      component.email.setValue('good@example.com');
      expect(component.email.valid).toBe(true);
    });

    it('should validate password minLength of 8', () => {
      component.password.setValue('');
      expect(component.password.hasError('required')).toBe(true);
      component.password.setValue('short');
      expect(component.password.hasError('minlength')).toBe(true);
      component.password.setValue('longenough');
      expect(component.password.valid).toBe(true);
    });

    it('should be valid with all fields filled correctly', () => {
      component.form.patchValue({
        firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', password: 'password123',
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not call service when form is invalid', () => {
      component.onSubmit();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register, show success, and navigate after 2s', () => {
      vi.useFakeTimers();
      component.form.patchValue({
        firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', password: 'password123',
      });
      authService.register.mockReturnValue(of(mockResponse));

      component.onSubmit();

      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', password: 'password123',
      });
      expect(component.success).toBe(true);

      vi.advanceTimersByTime(2000);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      vi.useRealTimers();
    });

    it('should show error message on failure', () => {
      component.form.patchValue({
        firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', password: 'password123',
      });
      authService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Email already exists' } }))
      );
      component.onSubmit();
      expect(component.error).toBe('Email already exists');
      expect(component.loading).toBe(false);
    });

    it('should show default error message when no error detail', () => {
      component.form.patchValue({
        firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', password: 'password123',
      });
      authService.register.mockReturnValue(throwError(() => ({})));
      component.onSubmit();
      expect(component.error).toBe('Rejestracja nie powiodła się. Spróbuj ponownie.');
    });

    it('should set loading state during submission', () => {
      component.form.patchValue({
        firstName: 'Jan', lastName: 'Kowalski', email: 'jan@example.com', password: 'password123',
      });
      authService.register.mockReturnValue(of(mockResponse));
      component.onSubmit();
      expect(component.loading).toBe(true);
    });
  });
});
