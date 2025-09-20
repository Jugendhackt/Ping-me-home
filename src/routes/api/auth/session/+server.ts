import { adminAuth } from '$lib/server/firebaseAdmin';
import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { idToken } = await request.json();
		
		if (!idToken) {
			return json({ error: 'ID Token ist erforderlich' }, { status: 400 });
		}
		
		console.log('🎫 Erstelle Session für ID Token:', idToken.substring(0, 20) + '...');
		
		if (!adminAuth || typeof adminAuth.createSessionCookie !== 'function') {
			console.error('❌ Firebase Admin nicht verfügbar oder nicht korrekt konfiguriert');
			console.error('💡 Bitte Firebase Admin SDK Umgebungsvariablen in .env konfigurieren');
			return json({ 
				error: 'Firebase Admin SDK nicht verfügbar - Session kann nicht erstellt werden' 
			}, { status: 503 });
		}
		
		console.log('🔥 Firebase Admin verfügbar - erstelle echte Session-Cookie');
		
		const expiresIn = 60 * 60 * 24 * 7 * 1000; // 1 week
		const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
		
		cookies.set('session', sessionCookie, {
			maxAge: expiresIn / 1000,
			httpOnly: true,
			secure: !dev, // In production, set secure to true
			sameSite: 'lax',
			path: '/'
		});
		
		console.log('✅ Firebase Session-Cookie erstellt');
		return json({ success: true, method: 'firebase-admin' });
		
	} catch (error: any) {
		console.error('❌ Fehler beim Erstellen der Session:', error);
		return json({ 
			error: 'Fehler beim Erstellen der Session: ' + (error?.message || error) 
		}, { status: 500 });
	}
}
