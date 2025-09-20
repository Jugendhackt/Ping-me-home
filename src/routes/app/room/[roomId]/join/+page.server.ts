import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error, isRedirect, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    try {
        const { room, user } = await validateRoomApiRequest(params.roomId, locals);

        if (room.members[user.uid] || !room.allowUrlJoining) {
            return redirect(303, `/app/room/${params.roomId}`);
        }

        return {
            roomName: room.name,
            roomId: params.roomId,
        };
    } catch (err) {
        if (isRedirect(err)) {
            throw err;
        }
        console.error('Failed to load room data:', err);
        throw error(404, 'Room not found or access denied');
    }
};
