import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../core/auth.store';

@Component({
  standalone: true,
  imports: [NgIf, FormsModule],
  template: `
    <div class="content-grid">
      <div class="main-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">You protected the mission.</h1>
            <p class="page-subtitle">
              This workspace unifies claims, education, and loan operations with role-based access and auditing.
            </p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Unified Work Queue</span>
              <span class="stat-icon">🧭</span>
            </div>
            <div class="stat-value">1</div>
            <div class="stat-change positive">One dashboard, fewer tools</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">RBAC</span>
              <span class="stat-icon">🔒</span>
            </div>
            <div class="stat-value">3</div>
            <div class="stat-change">Owner · Admin · Viewer</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Audit Trail</span>
              <span class="stat-icon">🧾</span>
            </div>
            <div class="stat-value">On</div>
            <div class="stat-change positive">Every action recorded</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">SQLite</span>
              <span class="stat-icon">💾</span>
            </div>
            <div class="stat-value">Ready</div>
            <div class="stat-change">Local + portable</div>
          </div>
        </div>

        <div class="activity-section">
          <div class="activity-header">
            <h3 class="activity-title">Demo credentials</h3>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">👤</div>
              <div class="activity-content">
                <div class="activity-text"><strong>sai@test.com</strong></div>
                <div class="activity-time">Password: <strong>123456</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="activity-section">
          <div class="activity-header">
            <h3 class="activity-title">{{ mode() === 'login' ? 'Sign in' : 'Create account' }}</h3>
          </div>

          <form (ngSubmit)="onSubmit()" #f="ngForm" style="margin-top: 12px;">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" name="email" [(ngModel)]="email" required autocomplete="username" />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" name="password" [(ngModel)]="password" required autocomplete="current-password" />
            </div>

            <button class="btn-primary" type="submit" [disabled]="loading() || !f.valid" style="width:100%;">
              {{
                loading()
                  ? (mode() === 'login' ? 'Logging in…' : 'Creating…')
                  : (mode() === 'login' ? 'Login' : 'Register')
              }}
            </button>

            <div *ngIf="error()" class="alert error" style="margin-top: 12px;">
              {{ error() }}
            </div>
          </form>

          <div style="margin-top: 12px; display:flex; justify-content:center; gap:8px; font-size: 13px;">
            <span style="color: var(--text-muted);">
              {{ mode() === 'login' ? 'New here?' : 'Already have an account?' }}
            </span>
            <a
              href="#"
              (click)="$event.preventDefault(); mode.set(mode() === 'login' ? 'register' : 'login'); error.set(null)"
              style="color: var(--accent); text-decoration: none; font-weight: 600;"
            >
              {{ mode() === 'login' ? 'Create one' : 'Sign in' }}
            </a>
          </div>

          <div style="margin-top: 14px; color: var(--text-muted); font-size: 12px;">
            Tip: Start the API first, then this dashboard.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage {
  email = '';
  password = '';

  mode = signal<'login' | 'register'>('login');

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthStore, private router: Router) {}

  async ngOnInit() {
    // If a token exists from a previous session, validate it against /api/auth/me.
    // This prevents "ghost" logins when the API restarts and rejects an old token.
    if (this.auth.token()) {
      await this.auth.loadMe();
      if (this.auth.isAuthed()) {
        await this.router.navigateByUrl('/tasks', { replaceUrl: true });
      }
    }
  }

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);

    try {
      const email = this.email.trim();
      const password = this.password;

      if (this.mode() === 'register') {
        await this.auth.register(email, password);
      } else {
        await this.auth.login(email, password);
      }
      await this.router.navigateByUrl('/tasks');
    } catch (e: any) {
      const msg =
        e?.error?.message ||
        e?.message ||
        (this.mode() === 'register'
          ? 'Registration failed. Try a different email or start the API.'
          : 'Login failed. Check API server + credentials.');
      this.error.set(String(msg));
    } finally {
      this.loading.set(false);
    }
  }
}
