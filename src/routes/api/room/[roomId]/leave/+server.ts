import { deleteRoom, validateRoomApiRequest, updateRoomMembership } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { room, roomId, user, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: ['member', 'owner'],
    });

    if (room.members[user.uid] === 'owner') {
        // Owner verlässt = Raum löschen
        await deleteRoom(roomId, room, roomRef);
    } else {
        // Normales Member verlässt
        await updateRoomMembership(room, roomRef, {
            [user.uid]: null // null = entfernen
        });
    }

    return json({ success: true });
};
