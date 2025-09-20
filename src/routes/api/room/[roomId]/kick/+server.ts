import { validateRoomApiRequest, updateRoomMembership } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef, user } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });
    
    const { userToKick } = await request.json();
    if (!userToKick) {
        throw error(400, 'Missing userToKick');
    }
    if (userToKick === user.uid) {
        throw error(400, 'You can\'t kick yourself!');
    }
    
    if (!room.members[userToKick]) {
        throw error(403, 'The specified user is not a member of the room!');
    }

    // Entferne User aus dem Raum
    await updateRoomMembership(room, roomRef, {
        [userToKick]: null // null = entfernen
    });
    
    return json({ success: true });
};
