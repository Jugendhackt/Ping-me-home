import { db } from '$lib/FirebaseConfig';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ref, update } from 'firebase/database';
import { validateRoomApiRequest, updateRoomMembership } from '$lib/server/apiUtils';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { room, user, roomRef } = await validateRoomApiRequest(params.roomId, locals);

	if (!room.allowUrlJoining) {
		throw error(403, 'This room does not allow URL joining!');
	}

	if (room.members[user.uid] && room.members[user.uid] !== 'invited') {
		throw error(400, 'You are already a member!');
	}

	if (room.members[user.uid] === 'invited') {
		// remove pending invite fromm user object
		const userRef = ref(db, `users/${user.uid}`);
		user.pendingInvites = user.pendingInvites?.filter((invite) => invite !== params.roomId) || [];
		update(userRef, user);
	}

	// Aktualisiere Membership konsistent
	await updateRoomMembership(room, roomRef, {
		[user.uid]: 'member'
	});
	return json({ success: true });
};
