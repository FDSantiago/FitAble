import type { User } from 'better-auth';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async (event) => {
  return {
    user: event.locals.user as User,
  }
});