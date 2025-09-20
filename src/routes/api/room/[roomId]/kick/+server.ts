import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });
    
    const { userToKick } = await request.json();
    if (!userToKick) {
        throw error(400, 'Missing userToKick');
    }
    
    if (!room.members[userToKick]) {
        throw error(403, 'The specified user is not a member of the room!');
    }

    delete room.members[userToKick];
    update(roomRef, room);
    return json({ success: true });
};
