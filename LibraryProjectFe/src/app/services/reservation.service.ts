import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReservationResponse,
  CreateReservationRequest,
  ReservationFilters,
} from '../models/reservation.model';
import { PaginatedResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private http: HttpClient) {}

  getMyReservations(
    page: number = 1,
    pageSize: number = 20
  ): Observable<PaginatedResponse<ReservationResponse>> {
    const params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);
    return this.http.get<PaginatedResponse<ReservationResponse>>(
      '/api/reservations',
      { params }
    );
  }

  getAllReservations(
    page: number = 1,
    pageSize: number = 20,
    filters: ReservationFilters = {}
  ): Observable<PaginatedResponse<ReservationResponse>> {
    let params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);

    if (filters.reservationId) {
      params = params.set('ReservationId', filters.reservationId.toString());
    }

    if (filters.readerName?.trim()) {
      params = params.set('ReaderName', filters.readerName.trim());
    }

    return this.http.get<PaginatedResponse<ReservationResponse>>(
      '/api/reservations/all',
      { params }
    );
  }

  getReservation(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`/api/reservations/${id}`);
  }

  createReservation(
    request: CreateReservationRequest
  ): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(
      '/api/reservations',
      request
    );
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.put<void>(`/api/reservations/${id}/cancel`, {});
  }

  fulfillReservation(id: number): Observable<void> {
    return this.http.put<void>(`/api/reservations/${id}/fulfill`, {});
  }
}
