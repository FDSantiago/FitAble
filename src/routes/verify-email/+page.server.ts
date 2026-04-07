// src/routes/auth/verified/+page.server.ts
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, request }) => {
  const token = url.searchParams.get('token');

  // 1. THE BOUNCER: No token? You can't be here.
  if (!token) {
    return { 
        success: false,
        code: "TOKEN_MISSING",
        message: "No token provided." 
    };
  }

  try {
    // 2. VERIFICATION: They have a token, but is it valid?
    // We pass the request context so Better-Auth can handle headers/cookies
    const response = await auth.api.verifyEmail({
      query: { token },
      headers: request.headers
    });

    if (!response) {
        throw new Error('Verification failed');
    }

    // 3. SUCCESS: The token was valid and consumed. 
    // We pass a success flag to the frontend to show the UI.
    return { 
        success: true
    };

  } catch (error) {
    console.error('Verification error:', error);
    // The token is invalid, expired, or already used.
    // You can redirect them, or return false to show an error state on the page.
    return { 
        success: false, 
        code: "TOKEN_INVALID_OR_EXPIRED",
        message: "This link is invalid or has expired." 
    };
  }
};