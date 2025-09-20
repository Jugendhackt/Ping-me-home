import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to app if already authenticated
	if (locals.user) {
		console.log('✅ User already authenticated, redirecting to app');
		throw redirect(302, '/app');
	}

	return {};
};
