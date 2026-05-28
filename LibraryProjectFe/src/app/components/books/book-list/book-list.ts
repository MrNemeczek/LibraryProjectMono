import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
import { BookResponse, CategoryResponse } from '../../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    Button,
    InputText,
    TableModule,
    Card,
    Tag,
    IconField,
    InputIcon,
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.scss',
})
export class BookList {
  private bookService = inject(BookService);
  protected authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  books: BookResponse[] = [];
  categories: CategoryResponse[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  titleFilter = '';
  authorFilter = '';
  categoryIdFilter: number | null = null;

  get isLibrarianOrAdmin(): boolean {
    return this.authService.hasAnyRole(['Librarian', 'Administrator']);
  }

  constructor() {
    afterNextRender(() => {
      this.loadCategories();
      this.loadBooks();
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks(this.page, this.pageSize, {
      title: this.titleFilter,
      author: this.authorFilter,
      categoryId: this.categoryIdFilter,
    }).subscribe({
      next: (response) => {
        this.books = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadCategories(): void {
    this.bookService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.markForCheck();
      },
    });
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadBooks();
  }

  onFiltersChange(): void {
    this.page = 1;
    this.loadBooks();
  }

  clearFilters(): void {
    this.titleFilter = '';
    this.authorFilter = '';
    this.categoryIdFilter = null;
    this.onFiltersChange();
  }

  viewBook(id: number): void {
    this.router.navigate(['/books', id]);
  }

  editBook(event: Event, id: number): void {
    event.stopPropagation();
    this.router.navigate(['/books', id, 'edit']);
  }
}
