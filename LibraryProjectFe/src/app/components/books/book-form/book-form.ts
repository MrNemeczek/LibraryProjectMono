import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { AutoComplete } from 'primeng/autocomplete';
import { Textarea } from 'primeng/textarea';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { BookService } from '../../../services/book.service';
import { BookCopyResponse, CategoryResponse } from '../../../models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    InputText,
    AutoComplete,
    Textarea,
    Card,
    Message,
    Tag,
  ],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isEdit = false;
  bookId = 0;
  loading = false;
  submitting = false;
  error = '';

  categories: CategoryResponse[] = [];
  filteredCategoryNames: string[] = [];
  existingCopies: BookCopyResponse[] = [];
  inventoryNumbers: string[] = [];
  newInventoryControl = this.fb.nonNullable.control('', [
    Validators.required,
    Validators.maxLength(50),
  ]);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', [Validators.required, Validators.maxLength(200)]],
    isbn: ['', [Validators.required, Validators.maxLength(20)]],
    description: ['', Validators.maxLength(2000)],
    categoryName: ['', [Validators.required, Validators.maxLength(100)]],
  });

  get title() { return this.form.controls.title; }
  get author() { return this.form.controls.author; }
  get isbn() { return this.form.controls.isbn; }
  get description() { return this.form.controls.description; }
  get categoryName() { return this.form.controls.categoryName; }

  ngOnInit(): void {
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.bookId = Number(idParam);
      if (!isNaN(this.bookId)) {
        this.loadBook();
      }
    }
  }

  loadCategories(): void {
    this.bookService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategoryNames = categories.map((category) => category.name);
        this.cdr.detectChanges();
      },
    });
  }

  filterCategories(event: { query: string }): void {
    const query = event.query.trim().toLocaleLowerCase();
    const categoryNames = this.categories.map((category) => category.name);

    this.filteredCategoryNames = query
      ? categoryNames.filter((name) => name.toLocaleLowerCase().includes(query))
      : categoryNames;
  }

  private loadBook(): void {
    this.loading = true;
    this.bookService.getBook(this.bookId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (book) => {
        this.form.patchValue({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          description: book.description,
          categoryName: book.categoryName,
        });
        this.existingCopies = book.copies;
      },
      error: () => {
        this.error = 'Nie znaleziono książki.';
      },
    });
  }

  addInventoryNumber(): void {
    const value = this.newInventoryControl.value.trim();
    if (!value || this.newInventoryControl.invalid) return;
    this.inventoryNumbers.push(value);
    this.newInventoryControl.reset();
  }

  removeInventoryNumber(index: number): void {
    this.inventoryNumbers.splice(index, 1);
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

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.error = '';

    const request = {
      ...this.form.getRawValue(),
      inventoryNumbers: this.inventoryNumbers.length > 0 ? this.inventoryNumbers : null,
    };

    const action = this.isEdit
      ? this.bookService.updateBook(this.bookId, request)
      : this.bookService.createBook(request);

    action.subscribe({
      next: () => {
        this.router.navigate(['/books']);
      },
      error: (err) => {
        this.error =
          err.error?.message ||
          'Operacja nie powiodła się. Spróbuj ponownie.';
        this.submitting = false;
      },
    });
  }
}
