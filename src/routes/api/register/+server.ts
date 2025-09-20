import { json } from '@sveltejs/kit';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '$lib/FirebaseConfig';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();
		
		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}
		
		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}
		
		// Create user with Firebase
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		
		console.log('✅ User created successfully:', user.email);
		
		return json({ 
			success: true, 
			user: {
				uid: user.uid,
				email: user.email,
				emailVerified: user.emailVerified
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