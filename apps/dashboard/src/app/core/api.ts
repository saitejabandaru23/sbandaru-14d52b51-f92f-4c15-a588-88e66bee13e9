import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export function api() {
  const http = inject(HttpClient);

  return {
    get<T>(url: string) {
      return firstValueFrom(http.get<T>(url, { headers: authHeaders() }));
    },
    post<T>(url: string, body: any) {
      return firstValueFrom(http.post<T>(url, body, { headers: authHeaders() }));
    },
    put<T>(url: string, body: any) {
      return firstValueFrom(http.put<T>(url, body, { headers: authHeaders() }));
    },
    delete<T>(url: string) {
      return firstValueFrom(http.delete<T>(url, { headers: authHeaders() }));
    },
  };
}

function authHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  let headers = new HttpHeaders();
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  return headers;
}
