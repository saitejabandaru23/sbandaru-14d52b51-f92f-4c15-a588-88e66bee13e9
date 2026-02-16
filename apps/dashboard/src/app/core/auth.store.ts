import { Injectable, signal } from '@angular/core';
import { api } from './api';

type Me = {
  sub: number;
  email: string;
  name?: string;
  role?: string;
  organizationId?: number;
  orgId?: number;
  orgName?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private http = api();

  token = signal<string | null>(localStorage.getItem('token'));
  me = signal<Me | null>(null);

  isAuthed() {
    return !!this.token();
  }

  async login(email: string, password: string) {
    const res = await this.http.post<{ accessToken: string }>(
      '/api/auth/login',
      { email, password }
    );

    const t = res?.accessToken ?? null;
    if (!t) throw new Error('No accessToken returned from API');

    localStorage.setItem('token', t);
    this.token.set(t);

    await this.loadMe();
  }

  /**
   * Creates a new account via /api/auth/register.
   * On success we immediately log in (API returns an accessToken).
   */
  async register(email: string, password: string) {
    const res = await this.http.post<{ accessToken: string }>(
      '/api/auth/register',
      { email, password }
    );

    const t = res?.accessToken ?? null;
    if (!t) throw new Error('No accessToken returned from API');

    localStorage.setItem('token', t);
    this.token.set(t);
    await this.loadMe();
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.me.set(null);
  }

  async loadMe() {
    const t = localStorage.getItem('token');
    this.token.set(t);

    if (!t) {
      this.me.set(null);
      return;
    }

    try {
      const me = await this.http.get<Me>('/api/auth/me');
      this.me.set(me ?? null);
    } catch {
      this.logout();
    }
  }
}
