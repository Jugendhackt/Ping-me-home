import { db } from "$lib/FirebaseConfig";
import { requireAuthentication } from "$lib/server/apiUtils";
import type { Room } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";
import { get, ref } from "firebase/database";

export interface UserRoom {
    roomId: string;
    name: string;
    role: 'owner' | 'member' | 'invited';
    allowUrlJoining: boolean;
    memberCount: number;
}

export const GET: RequestHandler = async ({ locals }) => {
    const user = requireAuthentication(locals);
    
    try {
        // Fetch user's rooms directly from users/{uid}/rooms
        const userRoomsRef = ref(db, `users/${user.uid}/rooms`);
        const userRoomsSnapshot = await get(userRoomsRef);
        
        if (!userRoomsSnapshot.exists()) {
            return json([]);
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
                        memberCount: Object.keys(roomData.members).length
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
        
        // Sort rooms by role priority (owner > member > invited) and then by name
        const rolePriority = { 'owner': 3, 'member': 2, 'invited': 1 };
        rooms.sort((a, b) => {
            const priorityDiff = rolePriority[b.role] - rolePriority[a.role];
            if (priorityDiff !== 0) return priorityDiff;
            return a.name.localeCompare(b.name);
        });
        
        return json(rooms);
    } catch (error) {
        console.error('Error fetching rooms data:', error);
        return json([]);
    }
};