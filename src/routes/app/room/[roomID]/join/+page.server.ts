import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { goto } from "$app/navigation";

export const load: PageServerLoad = async ({ params, locals }) => {
    try {
        const { room, user } = await validateRoomApiRequest(params.roomID, locals);

        if (room.members[user.uid] || !room.allowUrlJoining) {
            return goto(`/app/room/${params.roomID}`);
        }

        return {
            roomName: room.name,
            roomId: params.roomID,
        };
    } catch (err) {
        console.error('Failed to load room data:', err);
        throw error(404, 'Room not found or access denied');
    }
};
