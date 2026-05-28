import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthenticationResponse, AuthenticatedUser } from '../models/auth.model';

const mockUser: AuthenticatedUser = {
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan@example.com',
  role: 'Reader',
};

const mockResponse: AuthenticationResponse = {
  token: 'test-token-123',
  expiresAt: '2026-12-31T23:59:59Z',
  user: mockUser,
};

function createJwt(expiresInSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encode = (value: unknown) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode(header)}.${encode(payload)}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: { post: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();

    http = { post: vi.fn() };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: HttpClient, useValue: http }],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with null user when nothing stored', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('should restore user from localStorage on init', () => {
    localStorage.setItem('library_jwt_token', createJwt(60));
    localStorage.setItem('library_user', JSON.stringify(mockUser));
    const restored = new AuthService(http as unknown as HttpClient);
    expect(restored.currentUser()).toEqual(mockUser);
  });

  it('should clear stored user and token on init when token is expired', () => {
    localStorage.setItem('library_jwt_token', createJwt(-60));
    localStorage.setItem('library_user', JSON.stringify(mockUser));

    const restored = new AuthService(http as unknown as HttpClient);

    expect(restored.currentUser()).toBeNull();
    expect(localStorage.getItem('library_jwt_token')).toBeNull();
    expect(localStorage.getItem('library_user')).toBeNull();
  });

  describe('login', () => {
    it('should store token, user, and update signal on success', () => {
      http.post.mockReturnValue(of(mockResponse));

      service
        .login({ email: 'jan@example.com', password: 'pass123' })
        .subscribe();

      expect(localStorage.getItem('library_jwt_token')).toBe('test-token-123');
      expect(localStorage.getItem('library_user')).toBe(
        JSON.stringify(mockUser)
      );
      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and signal', () => {
      localStorage.setItem('library_jwt_token', 'token');
      localStorage.setItem('library_user', JSON.stringify(mockUser));
      service.currentUser.set(mockUser);

      service.logout();

      expect(localStorage.getItem('library_jwt_token')).toBeNull();
      expect(localStorage.getItem('library_user')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token is valid', () => {
      localStorage.setItem('library_jwt_token', createJwt(60));
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false and clear session when token is expired', () => {
      localStorage.setItem('library_jwt_token', createJwt(-60));
      localStorage.setItem('library_user', JSON.stringify(mockUser));
      service.currentUser.set(mockUser);

      expect(service.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('library_jwt_token')).toBeNull();
      expect(localStorage.getItem('library_user')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });

    it('should return false and clear session when token is invalid', () => {
      localStorage.setItem('library_jwt_token', 'invalid-token');
      localStorage.setItem('library_user', JSON.stringify(mockUser));
      service.currentUser.set(mockUser);

      expect(service.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('library_jwt_token')).toBeNull();
      expect(localStorage.getItem('library_user')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('library_jwt_token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      service.currentUser.set(mockUser);
      expect(service.hasRole('Reader')).toBe(true);
    });

    it('should return false when user has different role', () => {
      service.currentUser.set(mockUser);
      expect(service.hasRole('Administrator')).toBe(false);
    });

    it('should return false when no user', () => {
      expect(service.hasRole('Reader')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has one of the roles', () => {
      service.currentUser.set(mockUser);
      expect(service.hasAnyRole(['Administrator', 'Reader'])).toBe(true);
    });

    it('should return false when user has none of the roles', () => {
      service.currentUser.set(mockUser);
      expect(service.hasAnyRole(['Administrator', 'Librarian'])).toBe(false);
    });

    it('should return false when no user', () => {
      expect(service.hasAnyRole(['Reader'])).toBe(false);
    });
  });

  describe('private getStoredUser', () => {
    it('should return null for invalid JSON', () => {
      localStorage.setItem('library_user', '{invalid}');
      const service2 = new AuthService(http as unknown as HttpClient);
      expect(service2.currentUser()).toBeNull();
    });
  });
});
