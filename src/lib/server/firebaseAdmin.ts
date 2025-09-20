import admin from 'firebase-admin';
import { 
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID, 
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_DATABASE_URL 
} from '$env/static/private';
import type { DatabaseReference } from 'firebase/database';

// Überprüfung der Umgebungsvariablen
const requiredEnvVars = {
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_DATABASE_URL
};

const missingVars = Object.entries(requiredEnvVars).filter(([key, value]) => !value).map(([key]) => key);
let adminAuth: any = {} as any;
let adminDb: any = {} as any;

console.log('🔧 Firebase Admin Initialization Check:');
console.log('Missing environment variables:', missingVars);
console.log('Available env vars:', Object.entries(requiredEnvVars).map(([k, v]) => `${k}: ${v ? 'SET' : 'MISSING'}`));

if (missingVars.length > 0) {
  console.warn(`⚠️ Firebase Admin: Missing environment variables: ${missingVars.join(', ')}`);
  console.log('🔧 Firebase Admin wird nicht initialisiert - Claims können nicht gesetzt werden');
  // Exportiere leere Objekte für den Build-Prozess
} else {
  console.log('✅ Alle Firebase Admin Umgebungsvariablen vorhanden - initialisiere Admin SDK');
  
  const serviceAccount = {
    type: 'service_account',
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${FIREBASE_CLIENT_EMAIL}`
  };

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: FIREBASE_DATABASE_URL
      });
      console.log('✅ Firebase Admin App erfolgreich initialisiert');
    } else {
      console.log('✅ Firebase Admin App bereits vorhanden');
    }

    adminAuth = admin.auth();
    adminDb = admin.database();
    
    console.log('✅ Firebase Admin Auth und Database Services verfügbar');
    console.log('Admin Auth Methods:', Object.getOwnPropertyNames(adminAuth).filter(name => typeof adminAuth[name] === 'function').slice(0, 5));
    
  } catch (error) {
    console.error('❌ Firebase Admin Initialisierung fehlgeschlagen:', error);
    adminAuth = {} as any;
    adminDb = {} as any;
  }
}

export { adminAuth, adminDb };
