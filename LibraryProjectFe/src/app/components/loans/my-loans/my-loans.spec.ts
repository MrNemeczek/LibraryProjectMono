import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MyLoans } from './my-loans';
import { LoanService } from '../../../services/loan.service';
import { LoanResponse } from '../../../models/loan.model';

describe('MyLoans', () => {
  let component: MyLoans;
  let fixture: ComponentFixture<MyLoans>;
  let loanService: {
    getMyLoans: ReturnType<typeof vi.fn>;
  };

  const mockLoans: LoanResponse[] = [
    {
      id: 1,
      userId: 1,
      readerFirstName: 'Jan',
      readerLastName: 'Kowalski',
      bookCopyId: 101,
      bookCopyInventoryNumber: 'INV-101',
      reservationId: null,
      loanDate: '2026-01-15',
      returnDate: null,
      status: 'Active',
    },
    {
      id: 2,
      userId: 1,
      readerFirstName: 'Jan',
      readerLastName: 'Kowalski',
      bookCopyId: 102,
      bookCopyInventoryNumber: 'INV-102',
      reservationId: null,
      loanDate: '2025-12-01',
      returnDate: '2025-12-20',
      status: 'Returned',
    },
  ];

  beforeEach(async () => {
    loanService = { getMyLoans: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MyLoans],
      providers: [{ provide: LoanService, useValue: loanService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyLoans);
    component = fixture.componentInstance;
  });

  describe('loadLoans', () => {
    it('should load loans from service', () => {
      loanService.getMyLoans.mockReturnValue(
        of({ items: mockLoans, totalCount: 2, page: 1, pageSize: 20, totalPages: 1 })
      );

      component.loadLoans();

      expect(loanService.getMyLoans).toHaveBeenCalledWith(1, 20);
      expect(component.loans.length).toBe(2);
      expect(component.totalCount).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle error gracefully', () => {
      loanService.getMyLoans.mockReturnValue(throwError(() => ({})));

      component.loadLoans();

      expect(component.loading).toBe(false);
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
