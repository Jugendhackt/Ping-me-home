import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { get, ref } from "firebase/database";
import { db } from "$lib/FirebaseConfig";

export const load: PageServerLoad = async ({ params, locals }) => {
    try {
        const { room, user } = await validateRoomApiRequest(params.roomId, locals, {
            requiredUserRole: ['invited', 'member', 'owner']
        });

        if (room.members[user.uid] === 'invited') {
            return {
                isInvited: true,
                roomName: room.name,
                owner: room.members,
            }
        }

        const members: {
            uid: string;
            displayName: string;
            role: string;
            profileURL: string | undefined;
        }[] = [];

        for (const [uid, role] of Object.entries(room.members)) {
            if (role === 'invited') continue;
            const userRef = ref(db, `users/${uid}`);
            const userSnap = await get(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.val();
                members.push({
                    uid: uid,
                    displayName: userData.displayName || 'Unknown User',
                    role: role,
                    profileURL: userData.profileURL,
                });
            } else {
                members.push({
                    uid: uid,
                    displayName: 'N/A (Failed to load user data)',
                    role: role,
                    profileURL: undefined,
                });
            }
        }

        return {
            room: room,
            roomId: params.roomId,
            members: members.sort((a, b) => a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0),
            isOwner: room.members[user.uid] === 'owner',
        };
    } catch (err) {
        console.error('Failed to load room data:', err);
        throw error(404, 'Room not found or access denied');
    }
};
