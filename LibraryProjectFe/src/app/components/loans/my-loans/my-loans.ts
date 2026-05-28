import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { LoanService } from '../../../services/loan.service';
import { LoanResponse } from '../../../models/loan.model';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, Tag],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.scss',
})
export class MyLoans {
  private loanService = inject(LoanService);
  private cdr = inject(ChangeDetectorRef);

  loans: LoanResponse[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 20;
  loading = false;

  constructor() {
    afterNextRender(() => {
      this.loadLoans();
    });
  }

  loadLoans(): void {
    this.loading = true;
    this.loanService.getMyLoans(this.page, this.pageSize).subscribe({
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

}
