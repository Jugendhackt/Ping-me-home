import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { room, user, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'invited',
    });

    room.members[user.uid] = 'member';
    update(roomRef, room);
    return json({ success: true });
};
