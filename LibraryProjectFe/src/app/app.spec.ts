import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { AuthService } from './services/auth.service';

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

describe('App', () => {
  let authService: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    hasAnyRole: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<null>>;
  };

  beforeEach(async () => {
    authService = {
      isLoggedIn: vi.fn(),
      hasAnyRole: vi.fn(),
      currentUser: signal(null) as any,
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter() },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show navbar when user is logged in', () => {
    authService.isLoggedIn.mockReturnValue(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  it('should hide navbar when user is not logged in', () => {
    authService.isLoggedIn.mockReturnValue(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeFalsy();
  });
});
