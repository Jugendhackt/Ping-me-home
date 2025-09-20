import type { Room } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { get, getDatabase, ref } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    if (!locals.user) {
        throw error(401, 'Please log in to use this endpoint!')
    }

    const { roomId } = params;
    const { userToKick } = await request.json();
    if (!userToKick) {
        throw error(400, 'Missing userToKick');
    }

    const db = getDatabase();
    const groupRef = ref(db, `rooms/${roomId}`);
    const value = await get(groupRef);
    if (!value.exists()) {
        throw error(404, 'Room not found');
    }
    
    const room: Room = value.val() as Room;
    // check permissions
    if (room.members[locals.user.uid] !== 'owner') {
        throw error(403, 'Only the owner can kick members!')
    }
    if (!room.members[userToKick]) {
        throw error(403, 'This user is not a member of the room!');
    }

    delete room.members[userToKick];
    return json({ success: true });
};
