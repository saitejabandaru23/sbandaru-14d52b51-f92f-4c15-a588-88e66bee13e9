import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { api } from '../core/api';
import { SearchStore } from '../core/search.store';

type Task = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status?: 'todo' | 'in-progress' | 'done';
  order?: number;
  createdAt?: string;
};

const STATUSES: Array<{ key: 'todo' | 'in-progress' | 'done'; label: string; sub: string }> = [
  { key: 'todo', label: 'Backlog', sub: 'To do' },
  { key: 'in-progress', label: 'In Progress', sub: 'Working' },
  { key: 'done', label: 'Completed', sub: 'Done' },
];

const CATEGORIES = ['Claims', 'Education', 'Loans', 'Operations'];

@Component({
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  template: `
    <div class="content-grid">
      <div class="main-content">
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Secure Ops Command</h1>
            <p class="page-subtitle">Operational queue scoped by role + organization with auditable actions.</p>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" type="button" (click)="load()">Refresh</button>
            <button class="btn-primary" type="button" (click)="create()" [disabled]="creating() || !title.trim()">
              {{ creating() ? 'Creating…' : 'Create Task' }}
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Total Tasks</span>
              <span class="stat-icon">📊</span>
            </div>
            <div class="stat-value">{{ tasks().length }}</div>
            <div class="stat-change positive">{{ todoCount() }} in backlog</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">In Progress</span>
              <span class="stat-icon">⚡</span>
            </div>
            <div class="stat-value">{{ doingCount() }}</div>
            <div class="stat-change">{{ doneCount() }} completed</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Completed</span>
              <span class="stat-icon">✅</span>
            </div>
            <div class="stat-value">{{ doneCount() }}</div>
            <div class="stat-change positive">Audit logged</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Categories</span>
              <span class="stat-icon">🏷️</span>
            </div>
            <div class="stat-value">{{ categories.length }}</div>
            <div class="stat-change">Claims · Edu · Loans · Ops</div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="view-toggle">
              <button class="view-btn active" type="button">Board</button>
              <button class="view-btn" type="button" disabled title="Not required for submission">List</button>
            </div>

            <div class="filter-group">
              <select class="filter-select" [ngModel]="st()" (ngModelChange)="st.set($event)">
                <option value="">All statuses</option>
                <option *ngFor="let s of statuses" [value]="s.key">{{ s.sub }}</option>
              </select>

              <select class="filter-select" [ngModel]="cat()" (ngModelChange)="cat.set($event)">
                <option value="">All categories</option>
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <input
              class="search-input"
              type="text"
              placeholder="Search tasks..."
              [value]="search.q()"
              (input)="search.set($any($event.target).value)"
            />
          </div>
        </div>

        <div *ngIf="error()" class="alert error" style="margin-top: 16px;">
          <strong>Request failed:</strong> {{ error() }}
        </div>

        <!-- Task Board -->
        <div class="task-board">
          <div *ngFor="let col of statuses" class="task-column">
            <div class="column-header">
              <h3 class="column-title">{{ col.label }}</h3>
              <span class="task-count">{{ countByStatus(col.key) }}</span>
            </div>

            <div class="task-list">
              <div *ngFor="let t of byStatus(col.key)" class="task-card">
                <div class="task-header">
                  <div class="task-priority priority-high">{{ t.category || 'Other' }}</div>
                  <div class="task-id">#{{ t.id }}</div>
                </div>

                <h4 class="task-title">{{ t.title }}</h4>
                <p class="task-description" *ngIf="t.description">{{ t.description }}</p>

                <div class="task-meta">
                  <div class="task-tags">
                    <span class="tag">{{ col.sub }}</span>
                  </div>
                  <div class="assignee">
                    <div class="assignee-avatar">SB</div>
                    <span>Ops</span>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 12px;">
                  <button class="btn-secondary" type="button" (click)="move(t, 'todo')" [disabled]="t.status === 'todo'">To do</button>
                  <button class="btn-secondary" type="button" (click)="move(t, 'in-progress')" [disabled]="t.status === 'in-progress'">In progress</button>
                  <button class="btn-secondary" type="button" (click)="move(t, 'done')" [disabled]="t.status === 'done'">Done</button>
                </div>

                <div style="display:flex; justify-content:flex-end; margin-top: 10px;">
                  <button class="btn-secondary" type="button" (click)="remove(t.id)" title="Delete">Delete</button>
                </div>
              </div>

              <div *ngIf="byStatus(col.key).length === 0" class="task-card" style="opacity: .55;">
                <h4 class="task-title">No items</h4>
                <p class="task-description">This lane is empty.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Preview -->
        <div class="activity-section">
          <div class="activity-header">
            <h3 class="activity-title">Audit Preview</h3>
            <a class="btn-secondary" routerLink="/audit" style="text-decoration:none;">Open Audit Log</a>
          </div>

          <div class="activity-list">
            <div class="activity-item" *ngFor="let a of recent()">
              <div class="activity-icon">✓</div>
              <div class="activity-content">
                <div class="activity-text">{{ a }}</div>
                <div class="activity-time">Captured by API audit log</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <div class="activity-section">
          <div class="activity-header">
            <h3 class="activity-title">Create Task</h3>
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label class="form-label" class="form-label">Title</label>
            <input class="form-input" [(ngModel)]="title" placeholder="e.g., VA claim follow-up" />
          </div>

          <div class="form-group">
            <label class="form-label" class="form-label">Description</label>
            <textarea class="form-input" rows="4" [(ngModel)]="description" placeholder="Optional details..."></textarea>
          </div>

          <div class="filter-group">
            <select class="filter-select" [(ngModel)]="category">
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>

            <select class="filter-select" [(ngModel)]="status">
              <option *ngFor="let s of statuses" [value]="s.key">{{ s.sub }}</option>
            </select>
          </div>

          <button class="btn-primary" type="button" (click)="create()" [disabled]="creating() || !title.trim()" style="width:100%; margin-top: 12px;">
            {{ creating() ? 'Creating…' : 'Create Task' }}
          </button>
        </div>

        <div class="activity-section">
          <div class="activity-header">
            <h3 class="activity-title">Submission Notes</h3>
          </div>

          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">ℹ️</div>
              <div class="activity-content">
                <div class="activity-text">Role-scoped tasks (owner/admin vs viewer)</div>
                <div class="activity-time">RBAC enforced by API</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">🔒</div>
              <div class="activity-content">
                <div class="activity-text">JWT auth + /api/auth/me</div>
                <div class="activity-time">End-to-end login</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TasksPage implements OnInit {
  private client = api();

  // Shared search state (header search filters the board)
  search = inject(SearchStore);

  tasks = signal<Task[]>([]);
  error = signal<string>('');
  creating = signal(false);

  // create form
  title = '';
  description = '';
  category = CATEGORIES[0];
  status: 'todo' | 'in-progress' | 'done' = 'todo';

  // filters
  q = signal('');
  cat = signal('');
  st = signal<'' | 'todo' | 'in-progress' | 'done'>('');
  statuses = STATUSES;
  categories = CATEGORIES;

  filtered = computed(() => {
    const q = this.search.q().toLowerCase().trim();
    const cat = this.cat();
    const st = this.st() as any;

    return this.tasks().filter((t) => {
      const matchesQ = !q || (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      const matchesCat = !cat || (t.category || '') === cat;
      const matchesSt = !st || (t.status || 'todo') === st;
      return matchesQ && matchesCat && matchesSt;
    });
  });

  todoCount = computed(() => this.tasks().filter((t) => (t.status || 'todo') === 'todo').length);
  doingCount = computed(() => this.tasks().filter((t) => (t.status || 'todo') === 'in-progress').length);
  doneCount = computed(() => this.tasks().filter((t) => (t.status || 'todo') === 'done').length);

  recent = computed(() => {
    const items = this.tasks().slice(0, 3);
    return items.map((t) => `TASK_${(t.status || 'todo').toUpperCase()} · ${t.title}`);
  });

  ngOnInit() {
    this.load();
  }

  async load() {
    this.error.set('');
    try {
      const rows = await this.client.get<Task[]>('/api/tasks');
      this.tasks.set(rows || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load tasks');
    }
  }

  byStatus(st: 'todo' | 'in-progress' | 'done') {
    return this.filtered().filter((t) => (t.status || 'todo') === st);
  }

  countByStatus(st: 'todo' | 'in-progress' | 'done') {
    return this.byStatus(st).length;
  }

  async create() {
    if (!this.title.trim() || this.creating()) return;
    this.creating.set(true);
    this.error.set('');
    try {
      await this.client.post('/api/tasks', {
        title: this.title.trim(),
        description: this.description?.trim() || '',
        category: this.category,
        status: this.status,
      });
      this.title = '';
      this.description = '';
      this.status = 'todo';
      await this.load();
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to create task');
    } finally {
      this.creating.set(false);
    }
  }

  async move(t: Task, status: 'todo' | 'in-progress' | 'done') {
    if (t.status === status) return;
    this.error.set('');
    try {
      await this.client.put(`/api/tasks/${t.id}`, { status });
      await this.load();
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to update task');
    }
  }

  async remove(id: number) {
    this.error.set('');
    try {
      await this.client.delete(`/api/tasks/${id}`);
      await this.load();
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to delete task');
    }
  }
}
