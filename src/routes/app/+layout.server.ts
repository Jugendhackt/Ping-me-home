import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		console.log('❌ App access denied - no authenticated user');
		throw redirect(302, '/login');
	}

	console.log('✅ App layout - user authenticated:', locals.user.email);
	
	return {
		user: locals.user
	};
};
