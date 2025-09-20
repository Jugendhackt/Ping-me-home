import { json } from '@sveltejs/kit';
import { adminDb } from '$lib/server/firebaseAdmin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		
		const { displayName, profileURL } = await request.json();
		
		if (!displayName || displayName.trim().length < 2) {
			return json({ error: 'Display name must be at least 2 characters' }, { status: 400 });
		}
		
		// Validate profileURL if provided
		if (profileURL && profileURL.trim()) {
			try {
				new URL(profileURL.trim());
			} catch {
				return json({ error: 'Invalid profile image URL' }, { status: 400 });
			}
		}
		
		if (!adminDb) {
			return json({ error: 'Database service unavailable' }, { status: 500 });
		}
		
		// Update user profile in Realtime Database
		const userRef = adminDb.ref(`users/${locals.user.uid}`);
		const updates = {
			displayName: displayName.trim(),
			profileURL: profileURL?.trim() || '',
			updatedAt: new Date().toISOString()
		};
		
		await userRef.update(updates);
		
		console.log('✅ Profile updated successfully for user:', locals.user.email);
		
		return json({ 
			success: true,
			message: 'Profile updated successfully'
		});
		
	} catch (error: any) {
		console.error('❌ Profile update error:', error);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
};