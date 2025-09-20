import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { room, user, roomRef } = await validateRoomApiRequest(params.roomId, locals);

    if (room.members[user.uid] && room.members[user.uid] !== 'invited') {
        throw error(400, 'You are already a member!');
    }

    room.members[user.uid] = 'member';
    update(roomRef, room);
    return json({ success: true });
};
