import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });
    
    const { newName } = await request.json();
    if (!newName) {
        throw error(400, 'Missing newName');
    }

    room.name = newName;
    update(roomRef, room);
    return json({ success: true });
};
