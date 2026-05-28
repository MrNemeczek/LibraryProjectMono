import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Navbar } from './navbar';
import { AuthService } from '../../services/auth.service';

function mockRouter() {
  return {
    navigate: vi.fn().mockResolvedValue(true),
    navigateByUrl: vi.fn().mockResolvedValue(true),
    createUrlTree: vi.fn(),
    serializeUrl: vi.fn().mockReturnValue(''),
    parseUrl: vi.fn(),
    isActive: vi.fn().mockReturnValue(true),
    url: '/books',
    events: { subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }) },
    getCurrentNavigation: vi.fn(),
    routerState: { snapshot: { root: { component: null } as any } },
  } as unknown as Router;
}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let authService: {
    hasAnyRole: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<null>>;
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      hasAnyRole: vi.fn(),
      isLoggedIn: vi.fn(),
      logout: vi.fn(),
      currentUser: signal(null) as any,
    };

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter() },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  describe('getters', () => {
    it('should delegate isLibrarianOrAdmin to authService.hasAnyRole', () => {
      authService.hasAnyRole.mockReturnValue(true);
      expect(component.isLibrarianOrAdmin).toBe(true);
      expect(authService.hasAnyRole).toHaveBeenCalledWith(['Librarian', 'Administrator']);
    });

    it('should delegate isLoggedIn to authService.isLoggedIn', () => {
      authService.isLoggedIn.mockReturnValue(true);
      expect(component.isLoggedIn).toBe(true);
      expect(authService.isLoggedIn).toHaveBeenCalled();
    });

    it('should return empty string for userName when no user', () => {
      authService.currentUser = signal(null) as any;
      expect(component.userName).toBe('');
    });
  });

  describe('menu', () => {
    it('should start closed', () => {
      expect(component.menuOpen).toBe(false);
    });

    it('should toggle menuOpen', () => {
      component.toggleMenu();
      expect(component.menuOpen).toBe(true);
      component.toggleMenu();
      expect(component.menuOpen).toBe(false);
    });

    it('should close menu', () => {
      component.menuOpen = true;
      component.closeMenu();
      expect(component.menuOpen).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call authService.logout, close menu, and navigate to /books', () => {
      component.menuOpen = true;
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(component.menuOpen).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/books']);
    });
  });
});
