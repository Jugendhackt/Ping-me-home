import type { Room } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { get, getDatabase, ref, remove } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw error(401, 'Please log in to use this endpoint!')
    }

    const { roomId } = params;
    
    const db = getDatabase();
    const groupRef = ref(db, `rooms/${roomId}`);
    const value = await get(groupRef);
    if (!value.exists()) {
        throw error(404, 'Room not found');
    }

    const room: Room = value.val() as Room;
    // check permissions
    const role = room.members[locals.user.uid];
    if (role !== 'owner') {
        throw error(403, 'Only the owner can delete the room!')
    }

    remove(groupRef);
    // TODO clean up / delete other stuff
    return json({ success: true });
};
