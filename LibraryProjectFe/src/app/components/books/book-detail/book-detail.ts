import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { BookService } from '../../../services/book.service';
import { ReservationService } from '../../../services/reservation.service';
import { BookResponse, BookCopyResponse } from '../../../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Card,
    Tag,
    Message,
    ToastModule,
    ConfirmDialog,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.scss',
})
export class BookDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private reservationService = inject(ReservationService);
  protected authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  book: BookResponse | null = null;
  loading = true;
  error = '';
  reserving = false;
  deleting = false;

  get isLibrarianOrAdmin(): boolean {
    return this.authService.hasAnyRole(['Librarian', 'Administrator']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error = 'Nieprawidłowy identyfikator książki.';
      this.loading = false;
      return;
    }
    this.loadBook(id);
  }

  private loadBook(id: number): void {
    this.loading = true;
    this.bookService.getBook(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (book) => {
        this.book = book;
      },
      error: () => {
        this.error = 'Nie znaleziono książki.';
      },
    });
  }

  reserve(): void {
    if (!this.book) return;
    this.reserving = true;
    this.reservationService
      .createReservation({ bookId: this.book.id })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Zarezerwowano',
            detail: 'Książka została zarezerwowana pomyślnie.',
          });
          this.reserving = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: err.error?.message || 'Nie udało się zarezerwować książki.',
          });
          this.reserving = false;
        },
      });
  }

  getCopyStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Available: 'Dostępna',
      Borrowed: 'Wypożyczona',
      Reserved: 'Zarezerwowana',
      Withdrawn: 'Wycofana',
    };
    return map[status] || status;
  }

  getCopyStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      Available: 'success',
      Borrowed: 'warn',
      Reserved: 'info',
      Withdrawn: 'danger',
    };
    return map[status] || 'info';
  }

  get availableCopiesCount(): number {
    return this.book?.copies.filter((c) => c.status === 'Available').length ?? 0;
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Czy na pewno chcesz usunąć tę książkę?',
      header: 'Potwierdzenie usunięcia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak, usuń',
      rejectLabel: 'Anuluj',
      accept: () => this.deleteBook(),
    });
  }

  private deleteBook(): void {
    if (!this.book) return;
    this.deleting = true;
    this.bookService.deleteBook(this.book.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Usunięto',
          detail: 'Książka została usunięta.',
        });
        this.deleting = false;
        setTimeout(() => this.router.navigate(['/books']), 1500);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Blad',
          detail: err.error?.message || 'Nie udało się usunąć książki.',
        });
        this.deleting = false;
      },
    });
  }
}
