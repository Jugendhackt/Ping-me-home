import type { Room } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { get, getDatabase, ref } from "firebase/database";

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
    if (!room.members[locals.user.uid]) {
        throw error(403, 'You are not a member of this room!')
    }

    delete room.members[locals.user.uid];
    return json({ success: true });
};
