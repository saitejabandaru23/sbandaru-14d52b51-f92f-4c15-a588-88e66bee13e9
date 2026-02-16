import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { api } from '../core/api';

type AuditRow = {
  id: number;
  at: string;
  action: string;
  actorUserId: number;
  actorEmail?: string;
  orgId?: number;
  resource?: string;
  resourceId?: number;
  allowed: boolean;
  details?: string;
};

@Component({
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Audit Log</h1>
        <p class="page-subtitle">Security events captured for task access and administrative actions.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" type="button" (click)="load()">Refresh</button>
      </div>
    </div>

    <div *ngIf="error()" class="alert error" style="margin-top: 16px;">
      <strong>Request failed:</strong> {{ error() }}
    </div>

    <div class="activity-section" style="margin-top: 20px;">
      <div class="activity-header">
        <h3 class="activity-title">Recent Events</h3>
        <div class="stat-change">{{ rows().length }} events</div>
      </div>

      <div class="data-table" style="margin-top: 12px;">
        <table class="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Org</th>
              <th>Result</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let r of rows()">
              <td>{{ r.at }}</td>
              <td>
                <div style="display:flex; flex-direction:column; gap: 2px;">
                  <div style="font-weight:600;">User #{{ r.actorUserId }}</div>
                  <div style="color: var(--text-muted); font-size: 12px;">{{ r.actorEmail || '' }}</div>
                </div>
              </td>
              <td>
                <div style="font-weight:600;">{{ r.action }}</div>
                <div style="color: var(--text-muted); font-size: 12px;" *ngIf="r.details">{{ r.details }}</div>
              </td>
              <td>{{ r.resource || '-' }} <span style="color: var(--text-muted);" *ngIf="r.resourceId">#{{ r.resourceId }}</span></td>
              <td>Org {{ r.orgId || '-' }}</td>
              <td>
                <span class="status-badge" [class.active]="r.allowed" [class.pending]="!r.allowed">
                  {{ r.allowed ? 'Allowed' : 'Denied' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 12px; color: var(--text-muted); font-size: 12px;">
        Owners/Admins can view audit logs. Viewers are blocked by RBAC.
      </div>
    </div>
  `,
})
export class AuditPage implements OnInit {
  private client = api();
  rows = signal<AuditRow[]>([]);
  error = signal<string>('');

  ngOnInit() {
    this.load();
  }

  async load() {
    this.error.set('');
    try {
      const rows = await this.client.get<AuditRow[]>('/api/audit-log');
      this.rows.set(rows || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load audit log');
    }
  }
}
