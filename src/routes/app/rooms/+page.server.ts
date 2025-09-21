import { db } from "$lib/FirebaseConfig";
import { requireAuthentication } from "$lib/server/apiUtils";
import type { Room } from "$lib/types";
import { get, ref } from "firebase/database";
import type { PageServerLoad } from './$types';

export interface UserRoom {
    roomId: string;
    name: string;
    role: 'owner' | 'member' | 'invited';
    allowUrlJoining: boolean;
    memberCount: number;
}

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const user = requireAuthentication(locals);
        
        // Fetch user's rooms directly from users/{uid}/rooms
        const userRoomsRef = ref(db, `users/${user.uid}/rooms`);
        const userRoomsSnapshot = await get(userRoomsRef);
        
        if (!userRoomsSnapshot.exists()) {
            return {
                rooms: []
            };
        }
        
        const userRoomsData = userRoomsSnapshot.val();
        const rooms: UserRoom[] = [];
        
        // For each room the user is part of, fetch room details
        const roomPromises = Object.entries(userRoomsData).map(async ([roomId, role]) => {
            try {
                const roomRef = ref(db, `rooms/${roomId}`);
                const roomSnapshot = await get(roomRef);
                
                if (roomSnapshot.exists()) {
                    const roomData: Room = roomSnapshot.val();
                    return {
                        roomId,
                        name: roomData.name,
                        role: role as 'owner' | 'member' | 'invited',
                        allowUrlJoining: roomData.allowUrlJoining,
                        memberCount: Object.keys(roomData.members).filter(m => roomData.members[m].role !== 'invited').length,
                    };
                }
                return null;
            } catch (error) {
                console.warn(`Failed to load room ${roomId}:`, error);
                return null;
            }
        });
        
        const roomsData = await Promise.all(roomPromises);
        
        // Filter out null values and add to results
        roomsData.forEach(room => {
            if (room) {
                rooms.push(room);
            }
        });
        
        return {
            rooms
        };
    } catch (error) {
        console.error('Error loading rooms:', error);
        return {
            rooms: []
        };
    }
};