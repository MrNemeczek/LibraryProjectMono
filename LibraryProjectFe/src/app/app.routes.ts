import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./components/books/book-list/book-list').then(
        (m) => m.BookList
      ),
    canActivate: [authGuard],
  },
  {
    path: 'books/new',
    loadComponent: () =>
      import('./components/books/book-form/book-form').then(
        (m) => m.BookForm
      ),
    canActivate: [() => roleGuard(['Librarian', 'Administrator'])],
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./components/books/book-detail/book-detail').then(
        (m) => m.BookDetail
      ),
    canActivate: [authGuard],
  },
  {
    path: 'books/:id/edit',
    loadComponent: () =>
      import('./components/books/book-form/book-form').then(
        (m) => m.BookForm
      ),
    canActivate: [() => roleGuard(['Librarian', 'Administrator'])],
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import(
        './components/reservations/my-reservations/my-reservations'
      ).then((m) => m.MyReservations),
    canActivate: [authGuard],
  },
  {
    path: 'reservations/all',
    loadComponent: () =>
      import(
        './components/reservations/all-reservations/all-reservations'
      ).then((m) => m.AllReservations),
    canActivate: [() => roleGuard(['Librarian', 'Administrator'])],
  },
  {
    path: 'loans',
    loadComponent: () =>
      import('./components/loans/my-loans/my-loans').then(
        (m) => m.MyLoans
      ),
    canActivate: [authGuard],
  },
  {
    path: 'loans/all',
    loadComponent: () =>
      import('./components/loans/all-loans/all-loans').then(
        (m) => m.AllLoans
      ),
    canActivate: [() => roleGuard(['Librarian', 'Administrator'])],
  },
  {
    path: '**',
    redirectTo: 'books',
  },
];
