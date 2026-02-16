import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { api } from '../core/api';
import { AuthStore } from '../core/auth.store';

type ProjectCard = { key: 'claims'|'edu'|'loans'|'ops'; title: string; description: string };

@Component({
  standalone: true,
  selector: 'app-projects-page',
  imports: [CommonModule, RouterModule],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="h-title">Projects</div>
      <div class="h-sub">Current project and quick entry points by workflow area.</div>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="card-title">Secure Ops Command <span class="pill">Current</span></div>
      <div class="card-desc" style="margin-top:10px;">
        This is the active workspace you’re demoing: JWT auth, RBAC (Owner/Admin/Viewer), a task board
        (Backlog → In progress → Completed), and an audit trail for every action.
      </div>
      <div class="card-actions">
        <a class="btn btn-primary" [routerLink]="['/tasks']">Open current board</a>
        <a class="btn btn-ghost" [routerLink]="['/audit']">Open reports</a>
      </div>
      <div class="card-desc" style="margin-top:10px;">
        More projects will be added soon (registry, exports, org management, metrics).
      </div>
    </div>

    <div class="grid4">
      <a class="card clickable" *ngFor="let p of projects" [routerLink]="['/tasks']" [queryParams]="{ cat: p.key }">
        <div class="card-title">{{ p.title }}</div>
        <div class="card-desc">{{ p.description }}</div>
      </a>
    </div>

    <div class="card" style="margin-top:18px;">
      <div class="card-title">RBAC note</div>
      <div class="card-desc">Owners/Admins see org-wide tasks. Viewers only see scoped tasks.</div>
    </div>
  </div>
  `,
  styles: [`
    .page{ padding:18px 18px 40px; max-width: 1180px; margin: 0 auto; }
    .page-header{ padding: 10px 6px 18px; }
    .h-title{ font-size: 22px; font-weight: 700; letter-spacing: .2px; }
    .h-sub{ margin-top:6px; color: rgba(255,255,255,0.7); }
    .grid4{ display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:14px; }
    @media (max-width: 1000px){ .grid4{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 560px){ .grid4{ grid-template-columns: 1fr; } }
    .card{ background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; }
    .pill{ display:inline-block; margin-left:8px; font-size:11px; padding:4px 8px; border-radius:999px; background: rgba(60,160,255,0.14); border: 1px solid rgba(60,160,255,0.3); color: rgba(200,230,255,0.95); vertical-align: middle; }
    .card-actions{ margin-top: 12px; display:flex; gap:10px; flex-wrap: wrap; }
    .clickable{ text-decoration:none; color: inherit; transition: transform .15s ease, border-color .15s ease, background .15s ease; }
    .clickable:hover{ transform: translateY(-1px); border-color: rgba(60,160,255,0.35); background: rgba(255,255,255,0.05); }
    .card-title{ font-weight: 700; }
    .card-desc{ margin-top:8px; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.4; }
  `]
})
export class ProjectsPage {
  projects: ProjectCard[] = [
    { key: 'claims', title: 'Claims', description: 'VA claims intake, follow-ups, and evidence workflows.' },
    { key: 'edu', title: 'Education', description: 'GI Bill / education benefits and enrollment tracking.' },
    { key: 'loans', title: 'Loans', description: 'Loan-related items and borrower communications.' },
    { key: 'ops', title: 'Ops', description: 'General operations, escalations, and admin tasks.' },
  ];
}
