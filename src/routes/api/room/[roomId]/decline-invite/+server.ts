import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest, updateRoomMembership, logRoomAction } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";
import { ref, update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    const {room, user, roomRef} = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'invited',
    });

    // Entferne User aus den Invites
    await updateRoomMembership(room, roomRef, {
        [user.uid]: null // null = entfernen
    });

    const userRef = ref(db, `users/${user.uid}`);
    const updatedPendingInvites = user.pendingInvites?.filter(invite => invite !== params.roomId) || [];
    await update(userRef, {
        pendingInvites: updatedPendingInvites
    });

    await logRoomAction(room, roomRef, user.uid, 'declined the invite');

    return json({ success: true });
};
