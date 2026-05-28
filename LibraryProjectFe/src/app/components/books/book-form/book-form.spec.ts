import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BookForm } from './book-form';
import { BookService } from '../../../services/book.service';
import { BookResponse, CategoryResponse } from '../../../models/book.model';

const mockBook: BookResponse = {
  id: 1,
  title: 'W pustyni i w puszczy',
  author: 'Henryk Sienkiewicz',
  isbn: '978-83-01-00001-1',
  description: 'Opis',
  categoryId: 1,
  categoryName: 'Przygodowa',
  copies: [
    { id: 1, inventoryNumber: 'INV-001', status: 'Available' },
    { id: 2, inventoryNumber: 'INV-002', status: 'Borrowed' },
  ],
};

const mockCategories: CategoryResponse[] = [
  { id: 1, name: 'Przygodowa' },
  { id: 2, name: 'Powieść' },
  { id: 3, name: 'Fantasy' },
];

describe('BookForm', () => {
  let component: BookForm;
  let fixture: ComponentFixture<BookForm>;
  let bookService: {
    getCategories: ReturnType<typeof vi.fn>;
    getBook: ReturnType<typeof vi.fn>;
    createBook: ReturnType<typeof vi.fn>;
    updateBook: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const createComponent = async (id: string | null) => {
    bookService = {
      getCategories: vi.fn().mockReturnValue(of(mockCategories)),
      getBook: vi.fn(),
      createBook: vi.fn(),
      updateBook: vi.fn(),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BookForm],
      providers: [
        { provide: BookService, useValue: bookService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => id } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookForm);
    component = fixture.componentInstance;
  };

  describe('ngOnInit', () => {
    it('should set isEdit to false when no id param', async () => {
      await createComponent(null);
      component.ngOnInit();
      expect(component.isEdit).toBe(false);
    });

    it('should load categories dictionary', async () => {
      await createComponent(null);

      component.ngOnInit();

      expect(bookService.getCategories).toHaveBeenCalled();
      expect(component.categories).toEqual(mockCategories);
      expect(component.filteredCategoryNames).toEqual(['Przygodowa', 'Powieść', 'Fantasy']);
    });

    it('should set isEdit to true and load book when id param present', async () => {
      await createComponent('1');
      bookService.getBook.mockReturnValue(of(mockBook));

      component.ngOnInit();

      expect(component.isEdit).toBe(true);
      expect(component.bookId).toBe(1);
      expect(bookService.getBook).toHaveBeenCalledWith(1);
      expect(component.title.value).toBe('W pustyni i w puszczy');
      expect(component.existingCopies.length).toBe(2);
    });

    it('should set error when book not found in edit mode', async () => {
      await createComponent('999');
      bookService.getBook.mockReturnValue(throwError(() => ({})));

      component.ngOnInit();

      expect(component.error).toBe('Nie znaleziono książki.');
    });
  });

  describe('form validation', () => {
    it('should be invalid when empty', async () => {
      await createComponent(null);
      component.ngOnInit();
      expect(component.form.valid).toBe(false);
    });

    it('should validate required fields', async () => {
      await createComponent(null);
      component.ngOnInit();

      expect(component.title.hasError('required')).toBe(true);
      expect(component.author.hasError('required')).toBe(true);
      expect(component.isbn.hasError('required')).toBe(true);
      expect(component.categoryName.hasError('required')).toBe(true);
    });

    it('should be valid with all required fields', async () => {
      await createComponent(null);
      component.ngOnInit();
      component.form.patchValue({
        title: 'Title',
        author: 'Author',
        isbn: '978-00-00000-00',
        categoryName: 'Fiction',
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('filterCategories', () => {
    it('should filter category suggestions by query', async () => {
      await createComponent(null);
      component.ngOnInit();

      component.filterCategories({ query: 'pow' });

      expect(component.filteredCategoryNames).toEqual(['Powieść']);
    });

    it('should show all category suggestions for empty query', async () => {
      await createComponent(null);
      component.ngOnInit();

      component.filterCategories({ query: '' });

      expect(component.filteredCategoryNames).toEqual(['Przygodowa', 'Powieść', 'Fantasy']);
    });
  });

  describe('inventory numbers', () => {
    beforeEach(async () => {
      await createComponent(null);
      component.ngOnInit();
    });

    it('should add inventory number', () => {
      component.newInventoryControl.setValue('INV-100');
      component.addInventoryNumber();

      expect(component.inventoryNumbers).toEqual(['INV-100']);
      expect(component.newInventoryControl.value).toBe('');
    });

    it('should not add empty inventory number', () => {
      component.newInventoryControl.setValue('');
      component.addInventoryNumber();

      expect(component.inventoryNumbers.length).toBe(0);
    });

    it('should remove inventory number by index', () => {
      component.inventoryNumbers = ['INV-001', 'INV-002', 'INV-003'];
      component.removeInventoryNumber(1);

      expect(component.inventoryNumbers).toEqual(['INV-001', 'INV-003']);
    });
  });

  describe('onSubmit', () => {
    it('should call createBook in create mode', async () => {
      await createComponent(null);
      component.ngOnInit();
      component.form.patchValue({
        title: 'New Book',
        author: 'Author',
        isbn: '978-00-00000-00',
        categoryName: 'Fiction',
      });
      bookService.createBook.mockReturnValue(of(mockBook));

      component.onSubmit();

      expect(bookService.createBook).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/books']);
    });

    it('should call updateBook in edit mode', async () => {
      await createComponent('1');
      bookService.getBook.mockReturnValue(of(mockBook));
      component.ngOnInit();
      bookService.updateBook.mockReturnValue(of(mockBook));

      component.onSubmit();

      expect(bookService.updateBook).toHaveBeenCalledWith(1, expect.any(Object));
      expect(router.navigate).toHaveBeenCalledWith(['/books']);
    });

    it('should include inventory numbers when present', async () => {
      await createComponent(null);
      component.ngOnInit();
      component.form.patchValue({
        title: 'New Book',
        author: 'Author',
        isbn: '978-00-00000-00',
        categoryName: 'Fiction',
      });
      component.inventoryNumbers = ['INV-100', 'INV-101'];
      bookService.createBook.mockReturnValue(of(mockBook));

      component.onSubmit();

      expect(bookService.createBook).toHaveBeenCalledWith({
        title: 'New Book',
        author: 'Author',
        isbn: '978-00-00000-00',
        description: '',
        categoryName: 'Fiction',
        inventoryNumbers: ['INV-100', 'INV-101'],
      });
    });

    it('should allow submitting category outside dictionary', async () => {
      await createComponent(null);
      component.ngOnInit();
      component.form.patchValue({
        title: 'New Book',
        author: 'Author',
        isbn: '978-00-00000-00',
        categoryName: 'Nowa kategoria',
      });
      bookService.createBook.mockReturnValue(of(mockBook));

      component.onSubmit();

      expect(bookService.createBook).toHaveBeenCalledWith({
        title: 'New Book',
        author: 'Author',
        isbn: '978-00-00000-00',
        description: '',
        categoryName: 'Nowa kategoria',
        inventoryNumbers: null,
      });
    });

    it('should set error on failure', async () => {
      await createComponent(null);
      component.ngOnInit();
      component.form.patchValue({
        title: 'New Book',
        author: 'Author',
        isbn: '978-00-00000-00',
        categoryName: 'Fiction',
      });
      bookService.createBook.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );

      component.onSubmit();

      expect(component.error).toBe('Error');
    });

    it('should not submit when form invalid', async () => {
      await createComponent(null);
      component.ngOnInit();

      component.onSubmit();

      expect(bookService.createBook).not.toHaveBeenCalled();
    });
  });

  describe('getCopyStatusLabel and getCopyStatusSeverity', () => {
    it('should map status to Polish labels', async () => {
      await createComponent(null);
      expect(component.getCopyStatusLabel('Available')).toBe('Dostępna');
      expect(component.getCopyStatusLabel('Borrowed')).toBe('Wypożyczona');
      expect(component.getCopyStatusLabel('Reserved')).toBe('Zarezerwowana');
      expect(component.getCopyStatusLabel('Withdrawn')).toBe('Wycofana');
    });

    it('should map status to severity', async () => {
      await createComponent(null);
      expect(component.getCopyStatusSeverity('Available')).toBe('success');
      expect(component.getCopyStatusSeverity('Borrowed')).toBe('warn');
      expect(component.getCopyStatusSeverity('Reserved')).toBe('info');
      expect(component.getCopyStatusSeverity('Withdrawn')).toBe('danger');
    });
  });
});
