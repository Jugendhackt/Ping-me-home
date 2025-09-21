import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest, updateRoomMembership, logRoomAction } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";
import { ref, update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { room, roomId, user, roomRef } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'invited',
    });

    // Update the membership persistently
    await updateRoomMembership(room, roomRef, {
        [user.uid]: 'member'
    });
    

    const userRef = ref(db, `users/${user.uid}`);
    const updatedPendingInvites = user.pendingInvites?.filter(invite => invite !== roomId) || [];
    await update(userRef, {
        pendingInvites: updatedPendingInvites
    });

    await logRoomAction(room, roomRef, user.uid, 'accepted the invite and joined the room');

    return json({ success: true });
};
