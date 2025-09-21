import { logRoomAction, validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef, user } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });
    
    const { newName } = await request.json();
    if (!newName) {
        throw error(400, 'Missing newName');
    }

    room.name = newName;
    update(roomRef, room);

    await logRoomAction(room, roomRef, user.uid, `renamed the room to "${newName}"`);

    return json({ success: true });
};
