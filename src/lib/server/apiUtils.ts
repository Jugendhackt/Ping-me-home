import { db } from "$lib/FirebaseConfig";
import type { Room, RoomRole, User } from "$lib/types";
import { error } from "@sveltejs/kit";
import { get, ref, remove, type DatabaseReference } from "firebase/database";

interface RoomApiHandlerConfig {
    requiredUserRole: RoomRole | undefined,
    mustBeMember: boolean,
}

export async function validateRoomApiRequest(
    roomId: string|undefined,
    locals: App.Locals,
    config: Partial<RoomApiHandlerConfig> = {
        requiredUserRole: undefined,
        mustBeMember: false,
    }
): Promise<{
    room: Room,
    user: User,
    roomRef: DatabaseReference,
}>{
    const user = locals.user;

    if (!user) {
        throw error(401, 'Please log in to use this endpoint!')
    }


    if (roomId === undefined) {
        throw error(400, 'Please provide a room ID!');
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const value = await get(roomRef);
    if (!value.exists()) {
        throw error(404, 'Room not found');
    }

    const room: Room = value.val() as Room;

    if (config.requiredUserRole !== undefined && room.members[user.uid] !== config.requiredUserRole) {
        throw error(403, `This endpoint requires the ${config.requiredUserRole} role in the room!`);
    }

    if (config.mustBeMember && !room.members[user.uid]) {
        throw error(403, 'You are not a member of this room!');
    }

    return {
        room,
        user,
        roomRef,
    }
}

export async function deleteRoom(room: Room, roomRef: DatabaseReference) {
    remove(roomRef);
    // TODO handle other stuff
}
