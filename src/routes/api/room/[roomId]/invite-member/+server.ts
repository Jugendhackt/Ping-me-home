import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });

    const { userToAdd } = await request.json();
    if (!userToAdd) {
        throw error(400, 'Missing userToAdd');
    }
    
    if (room.members[userToAdd]) {
        throw error(400, 'This user is already invited or a member!');
    }

    room.members[userToAdd] = 'invited';
    update(roomRef, room);
    return json({ success: true });
};
