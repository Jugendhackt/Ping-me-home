import { deleteRoom, validateRoomApiRequest } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { room, roomId, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });

    deleteRoom(roomId, room, roomRef);
    return json({ success: true });
};
