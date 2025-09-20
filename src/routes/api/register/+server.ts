import { json } from '@sveltejs/kit';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '$lib/FirebaseConfig';
import { ref, set } from 'firebase/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password, displayName } = await request.json();
		
		if (!email || !password || !displayName) {
			return json({ error: 'Email, password and display name are required' }, { status: 400 });
		}
		
		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}
		
		if (displayName.trim().length < 2) {
			return json({ error: 'Display name must be at least 2 characters' }, { status: 400 });
		}
		
		// Create user with Firebase
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		
		// Create user profile in Realtime Database
		const userRef = ref(db, `users/${user.uid}`);
		await set(userRef, {
			uid: user.uid,
			email: user.email,
			displayName: displayName.trim(),
			profileURL: '',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});
		
		console.log('✅ User created successfully:', user.email, 'with display name:', displayName);
		
		return json({ 
			success: true, 
			user: {
				uid: user.uid,
				email: user.email,
				displayName: displayName.trim()
			}
		});
		
	} catch (error: any) {
		console.error('❌ Registration error:', error);
		
		let errorMessage = 'Registration failed';
		
		switch (error.code) {
			case 'auth/email-already-in-use':
				errorMessage = 'Email already in use';
				break;
			case 'auth/invalid-email':
				errorMessage = 'Invalid email address';
				break;
			case 'auth/weak-password':
				errorMessage = 'Password is too weak';
				break;
			default:
				errorMessage = 'Registration failed. Please try again.';
		}
		
		return json({ error: errorMessage }, { status: 400 });
	}
};