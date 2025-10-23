import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7050/api/auth'; 

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    // Get client IP
    return this.http.get<{ ip: string }>('https://api.ipify.org?format=json').pipe(
      switchMap((res) => {
        const clientIp = res.ip;
        return this.http.post<any>(`${this.apiUrl}/login`, {
          username,
          password,
          clientIp
        });
      })
    );

  }

  register(username: string, password: string, fullName: string) {
  return this.http.post<any>(`${this.apiUrl}/register`, {
    username,
    password,
    fullName
  });
}


}
