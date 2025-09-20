import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";
import { ref, update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals }) => {
    const {room, user, roomRef} = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'invited',
    });

    delete room.members[user.uid];
    update(roomRef, room);

    const userRef = ref(db, `users/${user.uid}`);
    user.pendingInvites = user.pendingInvites?.filter(invite => invite !== params.roomId) || [];
    update(userRef, user);

    return json({ success: true });
};
