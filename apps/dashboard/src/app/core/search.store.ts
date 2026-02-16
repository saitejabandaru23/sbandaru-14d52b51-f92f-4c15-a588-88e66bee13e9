import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchStore {
  readonly q = signal<string>('');

  set(value: string) {
    this.q.set((value ?? '').toString());
  }

  clear() {
    this.q.set('');
  }
}
