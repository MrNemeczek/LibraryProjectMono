import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { BookList } from './book-list';
import { BookService } from '../../../services/book.service';
import { AuthService } from '../../../services/auth.service';
import { BookResponse, CategoryResponse } from '../../../models/book.model';
import { PaginatedResponse } from '../../../models/common.model';

const mockBooks: BookResponse[] = [
  {
    id: 1,
    title: 'W pustyni i w puszczy',
    author: 'Henryk Sienkiewicz',
    isbn: '978-83-01-00001-1',
    description: '',
    categoryId: 1,
    categoryName: 'Przygodowa',
    copies: [],
  },
  {
    id: 2,
    title: 'Lalka',
    author: 'Bolesław Prus',
    isbn: '978-83-01-00002-2',
    description: '',
    categoryId: 2,
    categoryName: 'Powieść',
    copies: [],
  },
  {
    id: 3,
    title: 'Pan Tadeusz',
    author: 'Adam Mickiewicz',
    isbn: '978-83-01-00003-3',
    description: '',
    categoryId: 3,
    categoryName: 'Poezja',
    copies: [],
  },
];

const mockPaginated: PaginatedResponse<BookResponse> = {
  items: mockBooks,
  page: 1,
  pageSize: 20,
  totalCount: 3,
  totalPages: 1,
};

const mockCategories: CategoryResponse[] = [
  { id: 1, name: 'Przygodowa' },
  { id: 2, name: 'Powieść' },
];

describe('BookList', () => {
  let component: BookList;
  let fixture: ComponentFixture<BookList>;
  let bookService: {
    getBooks: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
  };
  let authService: { hasAnyRole: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    bookService = {
      getBooks: vi.fn().mockReturnValue(of(mockPaginated)),
      getCategories: vi.fn().mockReturnValue(of(mockCategories)),
    };
    authService = { hasAnyRole: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        { provide: BookService, useValue: bookService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookList);
    component = fixture.componentInstance;
  });

  describe('loadBooks', () => {
    it('should load books with filters', () => {
      component.titleFilter = 'Lalka';
      component.authorFilter = 'Prus';
      component.categoryIdFilter = 2;

      component.loadBooks();

      expect(bookService.getBooks).toHaveBeenCalledWith(1, 20, {
        title: 'Lalka',
        author: 'Prus',
        categoryId: 2,
      });
      expect(component.books).toEqual(mockBooks);
      expect(component.totalCount).toBe(3);
    });
  });

  describe('loadCategories', () => {
    it('should load categories dictionary', () => {
      component.loadCategories();

      expect(bookService.getCategories).toHaveBeenCalled();
      expect(component.categories).toEqual(mockCategories);
    });
  });

  describe('filters', () => {
    it('should reset to first page and reload when filters change', () => {
      vi.spyOn(component, 'loadBooks').mockImplementation(() => {});
      component.page = 3;

      component.onFiltersChange();

      expect(component.page).toBe(1);
      expect(component.loadBooks).toHaveBeenCalled();
    });

    it('should clear filters and reload', () => {
      vi.spyOn(component, 'loadBooks').mockImplementation(() => {});
      component.titleFilter = 'Lalka';
      component.authorFilter = 'Prus';
      component.categoryIdFilter = 2;

      component.clearFilters();

      expect(component.titleFilter).toBe('');
      expect(component.authorFilter).toBe('');
      expect(component.categoryIdFilter).toBeNull();
      expect(component.loadBooks).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update page and pageSize and reload', () => {
      vi.spyOn(component, 'loadBooks').mockImplementation(() => {});

      component.onPageChange({ first: 20, rows: 10 });

      expect(component.page).toBe(3);
      expect(component.pageSize).toBe(10);
      expect(component.loadBooks).toHaveBeenCalled();
    });

    it('should compute page 1 correctly', () => {
      vi.spyOn(component, 'loadBooks').mockImplementation(() => {});

      component.onPageChange({ first: 0, rows: 20 });

      expect(component.page).toBe(1);
    });
  });

  describe('viewBook', () => {
    it('should navigate to book detail', () => {
      component.viewBook(5);
      expect(router.navigate).toHaveBeenCalledWith(['/books', 5]);
    });
  });

  describe('editBook', () => {
    it('should navigate to book edit with stopPropagation', () => {
      const event = { stopPropagation: vi.fn() } as unknown as Event;
      component.editBook(event, 3);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/books', 3, 'edit']);
    });
  });

  describe('isLibrarianOrAdmin', () => {
    it('should delegate to authService', () => {
      authService.hasAnyRole.mockReturnValue(true);
      expect(component.isLibrarianOrAdmin).toBe(true);
      expect(authService.hasAnyRole).toHaveBeenCalledWith([
        'Librarian',
        'Administrator',
      ]);
    });
  });
});
