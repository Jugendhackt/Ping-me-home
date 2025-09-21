import { validateRoomApiRequest, updateRoomMembership, logRoomAction } from "$lib/server/apiUtils";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef, user } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });
    
    const { userToPromote } = await request.json();
    if (!userToPromote) {
        throw error(400, 'Missing userToPromote');
    }
    if (userToPromote === user.uid) {
        throw error(400, 'You can\'t promote yourself!');
    }

    if (!room.members[userToPromote]) {
        throw error(403, 'The specified user is not a member of the room!');
    }
    if (room.members[userToPromote].role === 'owner') {
        throw error(400, 'The specified user is already an owner!');
    }

    await updateRoomMembership(room, roomRef, {
        [userToPromote]: 'owner'
    });
    await logRoomAction(room, roomRef, user.uid, `promoted user`, userToPromote);

    return json({ success: true });
};
