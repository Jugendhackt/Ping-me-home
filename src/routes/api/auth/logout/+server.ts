import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		// Clear the session cookie
		cookies.delete('session', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});

		console.log('✅ Session cookie cleared - user logged out');
		return json({ success: true });
	} catch (error) {
		console.error('❌ Logout error:', error);
		return json({ error: 'Logout failed' }, { status: 500 });
	}
};
