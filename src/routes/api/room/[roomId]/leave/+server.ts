import { deleteRoom, validateRoomApiRequest } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { room, user, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        mustBeMember: true,
    });

    if (room.members[user.uid] === 'owner') {
        deleteRoom(room, roomRef);
    } else {
        delete room.members[user.uid];
        update(roomRef, room);
    }

    return json({ success: true });
};
