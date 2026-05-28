import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AllReservations } from './all-reservations';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationResponse } from '../../../models/reservation.model';

describe('AllReservations', () => {
  let component: AllReservations;
  let fixture: ComponentFixture<AllReservations>;
  let reservationService: {
    getAllReservations: ReturnType<typeof vi.fn>;
    fulfillReservation: ReturnType<typeof vi.fn>;
  };

  const mockReservations: ReservationResponse[] = [
    {
      id: 1,
      readerFirstName: 'Jan',
      readerLastName: 'Kowalski',
      bookId: 1,
      bookTitle: 'W pustyni i w puszczy',
      reservationDate: '2026-01-15',
      pickupDeadline: '2026-01-22',
      status: 'Active',
    },
    {
      id: 2,
      readerFirstName: 'Anna',
      readerLastName: 'Nowak',
      bookId: 2,
      bookTitle: 'Lalka',
      reservationDate: '2025-12-01',
      pickupDeadline: '2025-12-08',
      status: 'Cancelled',
    },
  ];

  beforeEach(async () => {
    reservationService = { getAllReservations: vi.fn(), fulfillReservation: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AllReservations],
      providers: [{ provide: ReservationService, useValue: reservationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AllReservations);
    component = fixture.componentInstance;
  });

  describe('loadReservations', () => {
    it('should load all reservations from service', () => {
      reservationService.getAllReservations.mockReturnValue(
        of({
          items: mockReservations,
          totalCount: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        })
      );

      component.loadReservations();

      expect(reservationService.getAllReservations).toHaveBeenCalledWith(
        1,
        20,
        { reservationId: null, readerName: '' }
      );
      expect(component.reservations.length).toBe(2);
      expect(component.totalCount).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle error gracefully', () => {
      reservationService.getAllReservations.mockReturnValue(
        throwError(() => ({}))
      );

      component.loadReservations();

      expect(component.loading).toBe(false);
    });
  });

  describe('filters', () => {
    it('should reset to first page and reload when filters change', () => {
      const loadSpy = vi.spyOn(component, 'loadReservations').mockImplementation(() => {});
      component.page = 3;

      component.onFiltersChange();

      expect(component.page).toBe(1);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should clear filters and reload', () => {
      const loadSpy = vi.spyOn(component, 'loadReservations').mockImplementation(() => {});
      component.reservationIdFilter = 5;
      component.readerNameFilter = 'Jan Kowalski';

      component.clearFilters();

      expect(component.reservationIdFilter).toBeNull();
      expect(component.readerNameFilter).toBe('');
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should return reader full name', () => {
      expect(component.getReaderName(mockReservations[0])).toBe('Jan Kowalski');
    });
  });

  describe('getStatusLabel', () => {
    it('should return Polish labels', () => {
      expect(component.getStatusLabel('Active')).toBe('Aktywna');
      expect(component.getStatusLabel('Fulfilled')).toBe('Zrealizowana');
      expect(component.getStatusLabel('Cancelled')).toBe('Anulowana');
      expect(component.getStatusLabel('Expired')).toBe('Wygasła');
    });

    it('should return original string for unknown status', () => {
      expect(component.getStatusLabel('Unknown')).toBe('Unknown');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity', () => {
      expect(component.getStatusSeverity('Active')).toBe('info');
      expect(component.getStatusSeverity('Fulfilled')).toBe('success');
      expect(component.getStatusSeverity('Cancelled')).toBe('warn');
      expect(component.getStatusSeverity('Expired')).toBe('danger');
    });

    it('should return secondary for unknown status', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
    });
  });

  describe('fulfillReservation', () => {
    it('should call fulfillReservation and reload', () => {
      const loadSpy = vi.spyOn(component, 'loadReservations').mockImplementation(() => {});
      reservationService.fulfillReservation.mockReturnValue(
        of(undefined as any)
      );

      component.fulfillReservation(5);

      expect(reservationService.fulfillReservation).toHaveBeenCalledWith(5);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should handle error gracefully', () => {
      reservationService.fulfillReservation.mockReturnValue(
        throwError(() => ({}))
      );

      component.fulfillReservation(5);

      expect(reservationService.fulfillReservation).toHaveBeenCalledWith(5);
    });
  });
});
