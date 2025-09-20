import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    try {
        const { room } = await validateRoomApiRequest(params.roomID, locals, {
            requiredUserRole: ['invited', 'member', 'owner']
        });

        return {
            room: room,
            roomId: params.roomID
        };
    } catch (err) {
        console.error('Failed to load room data:', err);
        throw error(404, 'Room not found or access denied');
    }
};