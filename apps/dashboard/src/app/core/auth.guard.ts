import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  // If logged in → allow
  if (auth.isAuthed()) return true;

  // Not logged in → go to /login
  return router.createUrlTree(['/login']);
};
