import { logRoomAction, validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef, user } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: ['member', 'owner'],
    });
    
    const { arrived } = await request.json();
    if (arrived === undefined) {
        throw error(400, 'Missing arrived');
    }

    room.members[user.uid].arrived = arrived;
    update(roomRef, room);

    await logRoomAction(room, roomRef, user.uid, `marked themselves as ${arrived ? 'arrived' : 'not arrived'}`);

    return json({ success: true });
};
