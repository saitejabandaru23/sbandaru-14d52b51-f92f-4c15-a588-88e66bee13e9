import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthStore } from '../core/auth.store';
import { SearchStore } from '../core/search.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <header>
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <div class="logo-section">
              <div class="logo-icon">T</div>
              <div class="logo-text">Turbovets</div>
            </div>

            <nav class="nav-menu" *ngIf="auth.isAuthed()">
              <a routerLink="/tasks" routerLinkActive="active" class="nav-link">Dashboard</a>
              <a routerLink="/projects" routerLinkActive="active" class="nav-link">Projects</a>
              <a routerLink="/audit" routerLinkActive="active" class="nav-link">Reports</a>
            </nav>
          </div>

          <div class="header-right" *ngIf="auth.isAuthed()">
            <div class="search-box">
              <input class="search-input" type="text" placeholder="Search tasks..." [value]="search.q()" (input)="search.set($any($event.target).value)" />
            </div>

            <div class="header-actions">
              <button class="icon-button" type="button" title="Notifications">🔔</button>
              <button class="icon-button" type="button" title="Settings">⚙️</button>
            </div>

            <div class="user-menu" title="Account">
              <div class="user-avatar">{{ initials() }}</div>
              <div class="user-details">
                <div class="user-name">{{ displayName() }}</div>
                <div class="user-role">{{ roleLabel() }}</div>
              </div>
            </div>

            <button class="btn-secondary" type="button" (click)="logout()">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="container">
        <ng-content></ng-content>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <section>
            <h4>About</h4>
            <p>
              TurboVets Secure Ops Dashboard is a compact, role-aware workspace for tracking operational tasks,
              moving work through a simple board, and auditing access for accountability.
            </p>
          </section>
          <section>
            <h4>Blog</h4>
            <p>
              Notes on RBAC, audit trails, and building internal tools that are fast, simple, and secure.
              More posts are coming soon.
            </p>
          </section>
          <section>
            <h4>Contact</h4>
            <ul class="footer-contact">
              <li><span class="muted">Name:</span> Sai Teja Bandaru</li>
              <li><span class="muted">Phone:</span> <a href="tel:+16823362337">+1 (682) 336-2337</a></li>
              <li><span class="muted">Mail:</span> <a href="mailto:saiteja.bandaru03@gmail.com">saiteja.bandaru03@gmail.com</a></li>
            </ul>
          </section>
        </div>
        <div class="footer-bottom">© {{ year }} Sai Teja Bandaru · TurboVets Secure Ops</div>
      </div>
    </footer>
  `,
})
export class ShellComponent implements OnInit {
  // Shared search state (header search filters tasks board)
  public search = inject(SearchStore);

  constructor(public auth: AuthStore, private router: Router) {}

  year = new Date().getFullYear();

  async ngOnInit() {
    await this.auth.loadMe();
    // If a stale token exists (e.g., API restarted), loadMe() will clear it.
    // In that case, force the user back to login.
    if (!this.auth.isAuthed()) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  async logout() {
    this.auth.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  displayName() {
    const me = this.auth.me();
    return me?.name || me?.email || 'User';
  }

  roleLabel() {
    const me = this.auth.me();
    return me?.role ? (me.role.charAt(0).toUpperCase() + me.role.slice(1)) : 'User';
  }

  initials() {
    const me = this.auth.me();
    const src = (me?.name || me?.email || 'U').toString().trim();
    const parts = src.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] ?? '');
    return (a + b).toUpperCase();
  }
}
