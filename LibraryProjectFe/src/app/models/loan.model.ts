export interface LoanResponse {
  id: number;
  userId: number;
  readerFirstName: string;
  readerLastName: string;
  bookCopyId: number;
  bookCopyInventoryNumber: string;
  reservationId?: number | null;
  loanDate: string;
  returnDate?: string | null;
  status: string;
}

export interface LoanFilters {
  readerName?: string | null;
  bookCopyInventoryNumber?: string | null;
}
