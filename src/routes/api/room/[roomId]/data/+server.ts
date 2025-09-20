import { validateRoomApiRequest } from "$lib/server/apiUtils";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, locals }) => {
    const { room, } = await validateRoomApiRequest(params.roomId, locals, {
        mustBeMember: true,
    });

    return json(room);
};
