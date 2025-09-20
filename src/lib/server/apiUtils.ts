import { db } from "$lib/FirebaseConfig";
import type { Room, RoomRole, User } from "$lib/types";
import { error } from "@sveltejs/kit";
import { get, ref, remove, update, type DatabaseReference } from "firebase/database";

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
    roomId: string,
    user: User,
    roomRef: DatabaseReference,
}> {
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
    if (requiredRoles !== undefined && (!room.members[user.uid] || room.members[user.uid] !in requiredRoles)) {
        throw error(403, `This endpoint requires one of the roles: ${requiredRoles.join(',')}`);
    }

    return {
        room,
        roomId,
        user,
        roomRef,
    }
}

export async function deleteRoom(roomId: string, room: Room, roomRef: DatabaseReference) {
    // TODO handle other stuff
    // TODO loop through users and delete invites
    remove(roomRef);
    // Lösche den Raum und alle User-Room-Zuordnungen
    const updates: Record<string, any> = {};
    
    // Lösche den Raum selbst
    updates[`rooms/${roomRef.key}`] = null;
    
    // Entferne den Raum aus allen User-Listen
    Object.keys(room.members).forEach(async userId => {
        updates[`users/${userId}/rooms/${roomRef.key}`] = null;
        
        if (room.members[userId] === 'invited') {
            const pendingInvitesRef = ref(db, `users/${userId}/pendingInvites`);
            const pendingInvitesSnapshot = await get(pendingInvitesRef);
            if (pendingInvitesSnapshot.exists()) {
                const pendingInvites: string[] = pendingInvitesSnapshot.val() as string[];
                const updatedInvites = pendingInvites.filter(id => id !== roomId);
                updates[`users/${userId}/pendingInvites`] = updatedInvites;
            }
        }
    });
    
    await update(ref(db), updates);
}

/**
 * Aktualisiert Room-Mitgliedschaften und User-Room-Zuordnungen konsistent
 */
export async function updateRoomMembership(
    room: Room, 
    roomRef: DatabaseReference,
    membershipChanges: Record<string, RoomRole | null> // null = entfernen
): Promise<void> {
    const updates: Record<string, any> = {};
    
    // Aktualisiere Room-Members
    Object.entries(membershipChanges).forEach(([userId, role]) => {
        if (role === null) {
            room.members = room.members || {};
            delete room.members[userId];
            updates[`users/${userId}/rooms/${roomRef.key}`] = null;
        } else {
            room.members = room.members || {};
            room.members[userId] = role;
            updates[`users/${userId}/rooms/${roomRef.key}`] = role;
        }
    });
    
    // Update das Room-Object
    updates[`rooms/${roomRef.key}`] = room;
    
    await update(ref(db), updates);
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
