import { db } from "$lib/FirebaseConfig";
import { generateRandomId, requireAuthentication } from "$lib/server/apiUtils";
import type { Room } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { ref, update } from "firebase/database";

export const POST: RequestHandler = async ({ request, locals }) => {
    const user = requireAuthentication(locals);
    
    const { name, allowUrlJoining } = await request.json();
    if (!name) {
        throw error(400, 'Missing name');
    }
    
    const newRoomRef = ref(db, 'rooms/' + generateRandomId());
    const room: Room = {
        name: name,
        members: {
            [user.uid]: {
                uid: user.uid,
                role: 'owner',
                arrived: false,
            }
        },
        allowUrlJoining: allowUrlJoining ?? true,
        logs: [{
            timestamp: Date.now(),
            uid: user.uid,
            action: 'created the room'
        }]
    };
    
    // Create the room and add the room to the users' personal list
    const updates: Record<string, any> = {};
    updates[`rooms/${newRoomRef.key}`] = room;
    updates[`users/${user.uid}/rooms/${newRoomRef.key}`] = 'owner';
    
    await update(ref(db), updates);

    return json({ success: true, key: newRoomRef.key });
};
