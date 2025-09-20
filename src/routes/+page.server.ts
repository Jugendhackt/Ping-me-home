import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// If user is authenticated, redirect to app
	if (locals.user) {
		console.log('✅ Authenticated user visiting root - redirecting to app');
		throw redirect(302, '/app');
	}
	
	// Check if this is a PWA launch (standalone mode)
	// This helps detect when user opens the installed PWA
	const userAgent = url.searchParams.get('utm_source');
	const isPWALaunch = userAgent === 'pwa-launch' || url.searchParams.has('standalone');
	
	if (isPWALaunch) {
		console.log('🚀 PWA launch detected - showing optimized landing');
		return { isPWALaunch: true };
	}
	
	// Regular web visit - show normal landing page
	return { isPWALaunch: false };
};
