import { writable, derived, type Readable } from 'svelte/store';
import { onValue, ref, update, get } from 'firebase/database';
import { db } from '$lib/FirebaseConfig';
import { auth } from '$lib/FirebaseConfig';
import type { RoomRole } from '$lib/types';

export interface UserRoom {
    roomId: string;
    role: RoomRole;
    roomName?: string;
}

export interface UserRoomsState {
    rooms: UserRoom[];
    loading: boolean;
    error: string | null;
}

// Basis Store
const userRoomsStore = writable<UserRoomsState>({
    rooms: [],
    loading: false,
    error: null
});

let currentUnsubscribe: (() => void) | null = null;
let currentUserId: string | null = null;

/**
 * Startet realtime Listening für User-Räume
 */
function startListening(userId: string) {
    if (currentUnsubscribe && currentUserId === userId) {
        return; // Bereits am Listening für diesen User
    }

    // Stoppe vorheriges Listening
    stopListening();

    currentUserId = userId;
    userRoomsStore.update(state => ({ ...state, loading: true, error: null }));

    // Listen auf users/{uid}/rooms für direkte User-Room-Zuordnungen
    const userRoomsRef = ref(db, `users/${userId}/rooms`);
    
    currentUnsubscribe = onValue(userRoomsRef, async (snapshot) => {
        try {
            const userRoomsData = snapshot.val();
            
            if (!userRoomsData) {
                userRoomsStore.update(state => ({ 
                    ...state, 
                    rooms: [], 
                    loading: false,
                    error: null
                }));
                return;
            }

            // Lade Room-Details für jeden Raum
            const rooms: UserRoom[] = [];
            const roomPromises = Object.entries(userRoomsData).map(async ([roomId, role]) => {
                try {
                    const roomRef = ref(db, `rooms/${roomId}`);
                    const roomSnapshot = await get(roomRef);
                    
                    if (roomSnapshot.exists()) {
                        const roomData = roomSnapshot.val();
                        rooms.push({
                            roomId,
                            role: role as RoomRole,
                            roomName: roomData.name
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to load room ${roomId}:`, error);
                }
            });

            await Promise.all(roomPromises);

            userRoomsStore.update(state => ({
                ...state,
                rooms: rooms.sort((a, b) => a.roomName?.localeCompare(b.roomName || '') || 0),
                loading: false,
                error: null
            }));

        } catch (error) {
            console.error('Error loading user rooms:', error);
            userRoomsStore.update(state => ({
                ...state,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load rooms'
            }));
        }
    }, (error) => {
        console.error('Firebase listener error:', error);
        userRoomsStore.update(state => ({
            ...state,
            loading: false,
            error: error.message || 'Connection error'
        }));
    });
}

/**
 * Stoppt das aktuelle Listening
 */
function stopListening() {
    if (currentUnsubscribe) {
        currentUnsubscribe();
        currentUnsubscribe = null;
    }
    currentUserId = null;
    userRoomsStore.update(state => ({
        ...state,
        rooms: [],
        loading: false,
        error: null
    }));
}

/**
 * Fügt einen Raum zu den User-Räumen hinzu
 */
export async function addUserToRoom(userId: string, roomId: string, role: RoomRole): Promise<void> {
    const updates: Record<string, any> = {};
    updates[`users/${userId}/rooms/${roomId}`] = role;
    
    await update(ref(db), updates);
}

/**
 * Entfernt einen User aus einem Raum
 */
export async function removeUserFromRoom(userId: string, roomId: string): Promise<void> {
    const updates: Record<string, any> = {};
    updates[`users/${userId}/rooms/${roomId}`] = null; // null löscht den Wert
    
    await update(ref(db), updates);
}

/**
 * Aktualisiert die Rolle eines Users in einem Raum
 */
export async function updateUserRoomRole(userId: string, roomId: string, role: RoomRole): Promise<void> {
    const updates: Record<string, any> = {};
    updates[`users/${userId}/rooms/${roomId}`] = role;
    
    await update(ref(db), updates);
}

/**
 * Hauptstore für User-Räume mit automatischem Auth-Management
 */
export const userRooms: Readable<UserRoomsState> = derived(
    userRoomsStore,
    ($userRooms) => $userRooms
);

// Auto-Management basierend auf Auth State
auth.onAuthStateChanged((user) => {
    if (user) {
        startListening(user.uid);
    } else {
        stopListening();
    }
});

// Export für manuelle Kontrolle
export const userRoomsControls = {
    startListening,
    stopListening,
    refresh: () => {
        if (currentUserId) {
            startListening(currentUserId);
        }
    }
};