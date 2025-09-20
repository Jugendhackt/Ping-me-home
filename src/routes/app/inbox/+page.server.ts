import { db } from "$lib/FirebaseConfig";
import { requireAuthentication } from "$lib/server/apiUtils";
import type { Room, User } from "$lib/types";
import { get, ref } from "firebase/database";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = requireAuthentication(locals);
    
    // Fetch user data to get pendingInvites
    const userRef = ref(db, `users/${user.uid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.exists() ? userSnapshot.val() as User : user;
    
    const pendingInvites = userData.pendingInvites || [];
    
    // Fetch room data for each pending invite
    const invitesWithRoomData = await Promise.all(
        pendingInvites.map(async (roomId: string) => {
            try {
                const roomRef = ref(db, `rooms/${roomId}`);
                const roomSnapshot = await get(roomRef);
                
                if (!roomSnapshot.exists()) {
                    return null; // Room doesn't exist anymore
                }
                
                const room = roomSnapshot.val() as Room;
                
                // Find the owner of the room
                const ownerUid = Object.keys(room.members).find(
                    uid => room.members[uid] === 'owner'
                );
                
                let ownerData = null;
                if (ownerUid) {
                    const ownerRef = ref(db, `users/${ownerUid}`);
                    const ownerSnapshot = await get(ownerRef);
                    if (ownerSnapshot.exists()) {
                        ownerData = ownerSnapshot.val() as User;
                    }
                }
                
                return {
                    roomId,
                    room,
                    owner: ownerData
                };
            } catch (error) {
                console.error(`Error fetching room ${roomId}:`, error);
                return null;
            }
        })
    );
    
    // Filter out null results (rooms that don't exist)
    const validInvites = invitesWithRoomData.filter(invite => invite !== null);
    
    return {
        user: userData,
        pendingInvites: validInvites
    };
};