import type { Room } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { get, getDatabase, ref } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    if (!locals.user) {
        throw error(401, 'Please log in to use this endpoint!')
    }

    const { roomId } = params;
    const { userToAdd } = await request.json();
    if (!userToAdd) {
        throw error(400, 'Missing userToAdd');
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
        throw error(403, 'Only the owner can invite members!')
    }
    if (room.members[userToAdd]) {
        throw error(403, 'This user is already invited or a member!');
    }

    room.members[userToAdd] = 'invited';
    return json({ success: true });
};
