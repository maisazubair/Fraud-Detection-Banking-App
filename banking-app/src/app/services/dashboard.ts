import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://localhost:7050/api/dashboard';

  constructor(private http: HttpClient) {}

  getAccounts(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/accounts/${userId}`);
  }

  getTransactions(accountId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${accountId}`);
  }

  createTransaction(payload: any) {
  // POST to Banking API
  return this.http.post(`${this.apiUrl}/create`, payload);
}

}
