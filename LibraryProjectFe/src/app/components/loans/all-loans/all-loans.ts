import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoanService } from '../../../services/loan.service';
import { LoanResponse } from '../../../models/loan.model';

@Component({
  selector: 'app-all-loans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Button, Card, ConfirmDialog, IconField, InputIcon, InputText, TableModule, Tag, ToastModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './all-loans.html',
  styleUrl: './all-loans.scss',
})
export class AllLoans {
  private loanService = inject(LoanService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  loans: LoanResponse[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  readerNameFilter = '';
  bookCopyInventoryNumberFilter = '';

  constructor() {
    afterNextRender(() => {
      this.loadLoans();
    });
  }

  loadLoans(): void {
    this.loading = true;
    this.loanService.getAllLoans(this.page, this.pageSize, {
      readerName: this.readerNameFilter,
      bookCopyInventoryNumber: this.bookCopyInventoryNumberFilter,
    }).subscribe({
      next: (response) => {
        this.loans = response.items;
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
    this.loadLoans();
  }

  onFiltersChange(): void {
    this.page = 1;
    this.loadLoans();
  }

  clearFilters(): void {
    this.readerNameFilter = '';
    this.bookCopyInventoryNumberFilter = '';
    this.onFiltersChange();
  }

  getReaderName(loan: LoanResponse): string {
    return `${loan.readerFirstName} ${loan.readerLastName}`.trim() || '-';
  }

  getStatusSeverity(status: string): 'warn' | 'info' | 'success' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'Active':
        return 'info';
      case 'Returned':
        return 'success';
      case 'Overdue':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Active':
        return 'Aktywne';
      case 'Returned':
        return 'Zwrócone';
      case 'Overdue':
        return 'Po terminie';
      default:
        return status;
    }
  }

  confirmReturn(id: number): void {
    this.confirmationService.confirm({
      message: 'Czy na pewno chcesz oznaczyć tę książkę jako zwróconą?',
      header: 'Zwrot książki',
      icon: 'pi pi-refresh',
      acceptLabel: 'Tak, zwróć',
      rejectLabel: 'Anuluj',
      accept: () => this.returnBook(id),
    });
  }

  private returnBook(id: number): void {
    this.loanService.returnBook(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Zwrócono',
          detail: 'Książka została zwrócona pomyślnie.',
        });
        this.loadLoans();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: err.error?.message || 'Nie udało się zwrócić książki.',
        });
      },
    });
  }
}
