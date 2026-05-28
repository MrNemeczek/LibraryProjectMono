import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MyReservations } from './my-reservations';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationResponse } from '../../../models/reservation.model';

describe('MyReservations', () => {
  let component: MyReservations;
  let fixture: ComponentFixture<MyReservations>;
  let reservationService: {
    getMyReservations: ReturnType<typeof vi.fn>;
    cancelReservation: ReturnType<typeof vi.fn>;
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
      readerFirstName: 'Jan',
      readerLastName: 'Kowalski',
      bookId: 2,
      bookTitle: 'Lalka',
      reservationDate: '2025-12-01',
      pickupDeadline: '2025-12-08',
      status: 'Cancelled',
    },
  ];

  beforeEach(async () => {
    reservationService = { getMyReservations: vi.fn(), cancelReservation: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MyReservations],
      providers: [{ provide: ReservationService, useValue: reservationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyReservations);
    component = fixture.componentInstance;
  });

  describe('loadReservations', () => {
    it('should load reservations from service', () => {
      reservationService.getMyReservations.mockReturnValue(
        of({
          items: mockReservations,
          totalCount: 2,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        })
      );

      component.loadReservations();

      expect(reservationService.getMyReservations).toHaveBeenCalledWith(1, 20);
      expect(component.reservations.length).toBe(2);
      expect(component.totalCount).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle error gracefully', () => {
      reservationService.getMyReservations.mockReturnValue(
        throwError(() => ({}))
      );

      component.loadReservations();

      expect(component.loading).toBe(false);
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
});
