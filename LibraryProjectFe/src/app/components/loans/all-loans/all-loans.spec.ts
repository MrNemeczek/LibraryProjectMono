import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AllLoans } from './all-loans';
import { LoanService } from '../../../services/loan.service';
import { LoanResponse } from '../../../models/loan.model';

describe('AllLoans', () => {
  let component: AllLoans;
  let fixture: ComponentFixture<AllLoans>;
  let loanService: {
    getAllLoans: ReturnType<typeof vi.fn>;
    returnBook: ReturnType<typeof vi.fn>;
  };

  const mockLoans: LoanResponse[] = [
    {
      id: 1,
      userId: 2,
      readerFirstName: 'Anna',
      readerLastName: 'Nowak',
      bookCopyId: 101,
      bookCopyInventoryNumber: 'INV-101',
      reservationId: null,
      loanDate: '2026-01-15',
      returnDate: null,
      status: 'Active',
    },
    {
      id: 2,
      userId: 3,
      readerFirstName: 'Piotr',
      readerLastName: 'Zielinski',
      bookCopyId: 102,
      bookCopyInventoryNumber: 'INV-102',
      reservationId: null,
      loanDate: '2025-12-01',
      returnDate: '2025-12-20',
      status: 'Returned',
    },
  ];

  beforeEach(async () => {
    loanService = { getAllLoans: vi.fn(), returnBook: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AllLoans],
      providers: [{ provide: LoanService, useValue: loanService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AllLoans);
    component = fixture.componentInstance;
  });

  describe('loadLoans', () => {
    it('should load all loans from service', () => {
      loanService.getAllLoans.mockReturnValue(
        of({ items: mockLoans, totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })
      );

      component.loadLoans();

      expect(loanService.getAllLoans).toHaveBeenCalledWith(1, 20, {
        readerName: '',
        bookCopyInventoryNumber: '',
      });
      expect(component.loans.length).toBe(2);
      expect(component.totalCount).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle error gracefully', () => {
      loanService.getAllLoans.mockReturnValue(throwError(() => ({})));

      component.loadLoans();

      expect(component.loading).toBe(false);
    });
  });

  describe('filters', () => {
    it('should pass filters to service', () => {
      loanService.getAllLoans.mockReturnValue(
        of({ items: mockLoans, totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })
      );
      component.readerNameFilter = 'Anna Nowak';
      component.bookCopyInventoryNumberFilter = 'INV-101';

      component.loadLoans();

      expect(loanService.getAllLoans).toHaveBeenCalledWith(1, 20, {
        readerName: 'Anna Nowak',
        bookCopyInventoryNumber: 'INV-101',
      });
    });

    it('should return reader full name', () => {
      expect(component.getReaderName(mockLoans[0])).toBe('Anna Nowak');
    });
  });

  describe('getStatusLabel', () => {
    it('should return Polish labels', () => {
      expect(component.getStatusLabel('Active')).toBe('Aktywne');
      expect(component.getStatusLabel('Returned')).toBe('Zwrócone');
      expect(component.getStatusLabel('Overdue')).toBe('Po terminie');
    });

    it('should return original string for unknown status', () => {
      expect(component.getStatusLabel('Unknown')).toBe('Unknown');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity', () => {
      expect(component.getStatusSeverity('Active')).toBe('info');
      expect(component.getStatusSeverity('Returned')).toBe('success');
      expect(component.getStatusSeverity('Overdue')).toBe('danger');
    });

    it('should return secondary for unknown status', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
    });
  });
});
