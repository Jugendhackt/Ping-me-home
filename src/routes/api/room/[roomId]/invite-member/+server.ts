import { db } from "$lib/FirebaseConfig";
import { validateRoomApiRequest, updateRoomMembership, logRoomAction } from "$lib/server/apiUtils";
import type { User } from "$lib/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { get, ref, update } from "firebase/database";

export const POST: RequestHandler = async ({ params, locals, request }) => {
    const { room, roomRef, user } = await validateRoomApiRequest(params.roomId, locals, {
        requiredUserRole: 'owner',
    });

    let { userToAdd, email } = await request.json();
    if (!userToAdd && !email) {
        throw error(400, 'Missing userToAdd or email in request body!');
    }

    let userToAddRef;
    if (userToAdd) {
        userToAddRef = ref(db, `users/${userToAdd}`);
    } else {
        // Lookup user by email
        // TODO this is trash code but it's 3 am rn
        const emailToFind = email.trim().toLowerCase();
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        if (!usersSnapshot.exists()) {
            throw error(400, 'No users found in the database!');
        }
        const usersData = usersSnapshot.val() as Record<string, User>;
        const foundEntry = Object.entries(usersData).find(([_, userData]) => userData.email?.toLowerCase() === emailToFind);
        if (!foundEntry) {
            throw error(400, 'No user found with the specified email!');
        }
        const [foundUid, _] = foundEntry;
        userToAddRef = ref(db, `users/${foundUid}`);
        userToAdd = foundUid;
    }

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
