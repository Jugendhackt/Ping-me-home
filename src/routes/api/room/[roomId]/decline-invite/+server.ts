import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest, updateRoomMembership } from "$lib/server/apiUtils";
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
    user.pendingInvites = user.pendingInvites?.filter(invite => invite !== params.roomId) || [];
    update(userRef, user);

    return json({ success: true });
};
