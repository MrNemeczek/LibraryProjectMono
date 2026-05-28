import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BookDetail } from './book-detail';
import { BookService } from '../../../services/book.service';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';
import { BookResponse, BookCopyResponse } from '../../../models/book.model';

const mockCopies: BookCopyResponse[] = [
  { id: 1, inventoryNumber: 'INV-001', status: 'Available' },
  { id: 2, inventoryNumber: 'INV-002', status: 'Borrowed' },
  { id: 3, inventoryNumber: 'INV-003', status: 'Available' },
  { id: 4, inventoryNumber: 'INV-004', status: 'Reserved' },
];

const mockBook: BookResponse = {
  id: 1,
  title: 'W pustyni i w puszczy',
  author: 'Henryk Sienkiewicz',
  isbn: '978-83-01-00001-1',
  description: 'Opis książki',
  categoryId: 1,
  categoryName: 'Przygodowa',
  copies: mockCopies,
};

describe('BookDetail', () => {
  let component: BookDetail;
  let fixture: ComponentFixture<BookDetail>;
  let bookService: { getBook: ReturnType<typeof vi.fn>; deleteBook: ReturnType<typeof vi.fn> };
  let reservationService: { createReservation: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const createComponent = async (id: string | null) => {
    bookService = { getBook: vi.fn(), deleteBook: vi.fn() };
    reservationService = { createReservation: vi.fn() };
    router = { navigate: vi.fn() };

    const authService = {
      isLoggedIn: vi.fn(),
      hasAnyRole: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BookDetail],
      providers: [
        { provide: BookService, useValue: bookService },
        { provide: ReservationService, useValue: reservationService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => id } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetail);
    component = fixture.componentInstance;
  };

  describe('ngOnInit', () => {
    it('should load book when id is valid', async () => {
      await createComponent('1');
      bookService.getBook.mockReturnValue(of(mockBook));

      component.ngOnInit();

      expect(bookService.getBook).toHaveBeenCalledWith(1);
      expect(component.book).toEqual(mockBook);
      expect(component.loading).toBe(false);
    });

    it('should set error when id is NaN', async () => {
      await createComponent('invalid');
      component.ngOnInit();

      expect(component.error).toBe('Nieprawidłowy identyfikator książki.');
      expect(component.loading).toBe(false);
    });

    it('should set error when book not found', async () => {
      await createComponent('999');
      bookService.getBook.mockReturnValue(throwError(() => ({})));

      component.ngOnInit();

      expect(component.error).toBe('Nie znaleziono książki.');
    });
  });

  describe('getCopyStatusLabel', () => {
    it('should return Polish labels', async () => {
      await createComponent('1');
      expect(component.getCopyStatusLabel('Available')).toBe('Dostępna');
      expect(component.getCopyStatusLabel('Borrowed')).toBe('Wypożyczona');
      expect(component.getCopyStatusLabel('Reserved')).toBe('Zarezerwowana');
      expect(component.getCopyStatusLabel('Withdrawn')).toBe('Wycofana');
    });

    it('should return original string for unknown status', async () => {
      await createComponent('1');
      expect(component.getCopyStatusLabel('Unknown')).toBe('Unknown');
    });
  });

  describe('getCopyStatusSeverity', () => {
    it('should return correct severity', async () => {
      await createComponent('1');
      expect(component.getCopyStatusSeverity('Available')).toBe('success');
      expect(component.getCopyStatusSeverity('Borrowed')).toBe('warn');
      expect(component.getCopyStatusSeverity('Reserved')).toBe('info');
      expect(component.getCopyStatusSeverity('Withdrawn')).toBe('danger');
    });

    it('should return info for unknown status', async () => {
      await createComponent('1');
      expect(component.getCopyStatusSeverity('Unknown')).toBe('info');
    });
  });

  describe('availableCopiesCount', () => {
    it('should count available copies', async () => {
      await createComponent('1');
      component.book = mockBook;
      expect(component.availableCopiesCount).toBe(2);
    });

    it('should return 0 when book is null', async () => {
      await createComponent('1');
      component.book = null;
      expect(component.availableCopiesCount).toBe(0);
    });
  });

  describe('reserve', () => {
    it('should call createReservation', async () => {
      await createComponent('1');
      component.book = mockBook;
      reservationService.createReservation.mockReturnValue(of(undefined as any));

      component.reserve();

      expect(reservationService.createReservation).toHaveBeenCalledWith({
        bookId: 1,
      });
    });

    it('should not call service when book is null', async () => {
      await createComponent('1');
      component.book = null;
      component.reserve();

      expect(reservationService.createReservation).not.toHaveBeenCalled();
    });
  });
});
