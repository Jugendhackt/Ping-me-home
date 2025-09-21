import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest, updateRoomMembership, logRoomAction } from "$lib/server/apiUtils";
import type { User } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { get, ref, update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef, user } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });

    const { userToAdd } = await request.json();
    if (!userToAdd) {
        throw error(400, 'Missing userToAdd');
    }

    const userToAddRef = ref(db, `users/${userToAdd}`);
    const userToAddSnapshot = await get(userToAddRef);
    if (!userToAddSnapshot.exists()) {
        throw error(400, 'The specified user doesn\'t exist!');
    }
    const userToAddData = userToAddSnapshot.val() as User;
    
    if (room.members[userToAdd]) {
        throw error(400, 'This user is already invited or a member!');
    }

    // Add User as 'invited' hinzu
    await updateRoomMembership(room, roomRef, {
        [userToAdd]: 'invited'
    });
    
    const pendingInvites = Array.isArray(userToAddData.pendingInvites)
        ? [...userToAddData.pendingInvites, params.roomId!]
        : [params.roomId!];
    await update(userToAddRef, { pendingInvites });

    await logRoomAction(room, roomRef, user.uid, `invited`, userToAdd);

    return json({ success: true });
};
