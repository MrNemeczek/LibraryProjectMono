import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationResponse } from '../../../models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, TableModule, Tag, ToastModule, ConfirmDialog],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss',
})
export class MyReservations {
  private reservationService = inject(ReservationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  reservations: ReservationResponse[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 20;
  loading = false;

  constructor() {
    afterNextRender(() => {
      this.loadReservations();
    });
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getMyReservations(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.reservations = response.items;
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

  onPageChange(event: { first: number; rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadReservations();
  }

  getStatusSeverity(status: string): 'warn' | 'info' | 'success' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'Active':
        return 'info';
      case 'Fulfilled':
        return 'success';
      case 'Cancelled':
        return 'warn';
      case 'Expired':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Active':
        return 'Aktywna';
      case 'Fulfilled':
        return 'Zrealizowana';
      case 'Cancelled':
        return 'Anulowana';
      case 'Expired':
        return 'Wygasła';
      default:
        return status;
    }
  }

  confirmCancel(id: number): void {
    this.confirmationService.confirm({
      message: 'Czy na pewno chcesz anulować tę rezerwację?',
      header: 'Anulowanie rezerwacji',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak, anuluj',
      rejectLabel: 'Nie',
      accept: () => this.cancelReservation(id),
    });
  }

  private cancelReservation(id: number): void {
    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Anulowano',
          detail: 'Rezerwacja została anulowana.',
        });
        this.loadReservations();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: err.error?.message || 'Nie udało się anulować rezerwacji.',
        });
      },
    });
  }
}
