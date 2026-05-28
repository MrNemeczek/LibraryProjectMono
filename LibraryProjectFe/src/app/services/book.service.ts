import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookFilters, BookResponse, CategoryResponse, CreateBookRequest, UpdateBookRequest } from '../models/book.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(private http: HttpClient) {}

  getBooks(
    page: number = 1,
    pageSize: number = 20,
    filters: BookFilters = {}
  ): Observable<PaginatedResponse<BookResponse>> {
    let params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);

    if (filters.title?.trim()) {
      params = params.set('Title', filters.title.trim());
    }

    if (filters.author?.trim()) {
      params = params.set('Author', filters.author.trim());
    }

    if (filters.categoryId) {
      params = params.set('CategoryId', filters.categoryId);
    }

    return this.http.get<PaginatedResponse<BookResponse>>('/api/books', { params });
  }

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>('/api/categories');
  }

  getBook(id: number): Observable<BookResponse> {
    return this.http.get<BookResponse>(`/api/books/${id}`);
  }

  createBook(request: CreateBookRequest): Observable<BookResponse> {
    return this.http.post<BookResponse>('/api/books', request);
  }

  updateBook(id: number, request: UpdateBookRequest): Observable<BookResponse> {
    return this.http.put<BookResponse>(`/api/books/${id}`, request);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`/api/books/${id}`);
  }
}
