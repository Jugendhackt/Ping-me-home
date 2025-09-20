import { db } from "$lib/FirebaseConfig";
import type { Room, RoomRole, User } from "$lib/types";
import { error } from "@sveltejs/kit";
import { get, ref, remove, type DatabaseReference } from "firebase/database";

interface RoomApiHandlerConfig {
    requiredUserRole: RoomRole | RoomRole[] | undefined,
}

export function requireAuthentication(locals: App.Locals): User {
    const user = locals.user;

    if (!user) {
        throw error(401, 'Please log in to use this endpoint!')
    }

    return user;
}

export async function validateRoomApiRequest(
    roomId: string|undefined,
    locals: App.Locals,
    config: Partial<RoomApiHandlerConfig> = {
        requiredUserRole: undefined,
    }
): Promise<{
    room: Room,
    user: User,
    roomRef: DatabaseReference,
}>{
    const user = requireAuthentication(locals);

    if (roomId === undefined) {
        throw error(400, 'Please provide a room ID!');
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const value = await get(roomRef);
    if (!value.exists()) {
        throw error(404, 'Room not found');
    }

    const room: Room = value.val() as Room;

    const requiredRoles: RoomRole[] | undefined = config.requiredUserRole === undefined
        ? undefined
        : Array.isArray(config.requiredUserRole)
            ? config.requiredUserRole
            : [config.requiredUserRole];
    if (requiredRoles !== undefined && room.members[user.uid] !in requiredRoles) {
        throw error(403, `This endpoint requires one of the roles: ${requiredRoles.join(',')}`);
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
    // TODO loop through users and delete invites
}

export function generateRandomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}
