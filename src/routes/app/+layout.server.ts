import { redirect } from '@sveltejs/kit';
import { adminAuth, adminDb } from '$lib/server/firebaseAdmin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		console.log('❌ App access denied - no authenticated user');
		throw redirect(302, '/login');
	}

	console.log('✅ App layout - user authenticated:', locals.user.email);
	console.log('🔍 locals.user data:', locals.user);
	
	// Try to get user profile from Realtime Database
	let userProfile = null;
	try {
		if (adminDb) {
			const userRef = adminDb.ref(`users/${locals.user.uid}`);
			const snapshot = await userRef.get();
			
			if (snapshot.exists()) {
				userProfile = snapshot.val();
				console.log('📄 Found user profile in DB:', userProfile);
			} else {
				console.log('⚠️ No profile found in DB, creating new one');
				// If no profile exists in DB, create a basic one
				userProfile = {
					uid: locals.user.uid,
					email: locals.user.email,
					displayName: locals.user.email?.split('@')[0] || 'User',
					profileURL: '',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				await userRef.set(userProfile);
				console.log('✅ Created new profile:', userProfile);
			}
		}
	} catch (error) {
		console.error('Error fetching user profile:', error);
		// Fallback profile
		userProfile = {
			uid: locals.user.uid,
			email: locals.user.email,
			displayName: locals.user.email?.split('@')[0] || 'User',
			profileURL: '',
		};
	}
	
	const finalUser = {
		...locals.user,
		...userProfile
	};
	console.log('🎯 Final user object being returned:', finalUser);
	
	return {
		user: finalUser
	};
};
