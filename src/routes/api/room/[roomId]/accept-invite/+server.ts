import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest, updateRoomMembership } from "$lib/server/apiUtils";
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
    user.pendingInvites = user.pendingInvites?.filter(invite => invite !== roomId) || [];
    update(userRef, user);

    return json({ success: true });
};
