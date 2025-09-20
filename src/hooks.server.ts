import type { Handle } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebaseAdmin';

export const handle: Handle = async ({ event, resolve }) => {
	// Get session cookie
	const sessionCookie = event.cookies.get('session');
	
	if (sessionCookie && adminAuth && typeof adminAuth.verifySessionCookie === 'function') {
		try {
			// Verify cookie and decode custom claims
			const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
			
			// Set user info in locals
			event.locals.user = {
				uid: decodedClaims.uid,
				email: decodedClaims.email,
				role: decodedClaims.role || 'user',
				emailVerified: decodedClaims.email_verified || false
			};
			
			console.log('✅ Session verified for user:', decodedClaims.email);
		} catch (error) {
			console.log('❌ Invalid session cookie:', error);
			// Remove session cookie if invalid
			event.cookies.delete('session', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};