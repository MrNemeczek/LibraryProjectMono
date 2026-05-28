export interface ReservationResponse {
  id: number;
  readerFirstName: string;
  readerLastName: string;
  bookId: number;
  bookTitle: string;
  reservationDate: string;
  pickupDeadline?: string | null;
  status: string;
}

export interface CreateReservationRequest {
  bookId: number;
  pickupDeadlineDays?: number | null;
}

export interface ReservationFilters {
  reservationId?: number | null;
  readerName?: string | null;
}
