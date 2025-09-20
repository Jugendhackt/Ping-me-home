import { db } from "$lib/FirebaseConfig";
import { generateRandomId } from "$lib/server/apiUtils";
import type { Room } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { ref, set } from "firebase/database";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Please log in to use this endpoint!')
    }
    
    const { name } = await request.json();
    if (!name) {
        throw error(400, 'Missing name');
    }
    
    const newRoomRef = ref(db, 'rooms/' + generateRandomId());
    const room: Room = {
        name: name,
        members: {
            [locals.user.uid]: 'owner',
        },
    };
    set(newRoomRef, room);
    return json({ success: true, key: newRoomRef.key });
};
