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

        if (room.members[user.uid].role === 'invited') {
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
            arrived: boolean;
        }[] = [];

        for (const [uid, member] of Object.entries(room.members)) {
            if (member.role === 'invited') continue;
            const userRef = ref(db, `users/${uid}`);
            const userSnap = await get(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.val();
                members.push({
                    uid: uid,
                    displayName: userData.displayName || 'Unknown User',
                    role: member.role,
                    profileURL: userData.profileURL,
                    arrived: member.arrived,
                });
            } else {
                members.push({
                    uid: uid,
                    displayName: 'N/A (Failed to load user data)',
                    role: member.role,
                    profileURL: undefined,
                    arrived: member.arrived,
                });
            }
        }

        const formattedLogs = await Promise.all(room.logs.map(async log => {
            const performer = members.find(m => m.uid === log.performerId);
            // get subject name, try to get from members first, then fallback to user data
            const subject = log.subjectId ? members.find(m => m.uid === log.subjectId) : null;
            let subjectName = subject ? subject.displayName : null;
            if (!subjectName && log.subjectId) {
                const subjectRef = ref(db, `users/${log.subjectId}`);
                const subjectSnap = await get(subjectRef);
                if (subjectSnap.exists()) {
                    const subjectData = subjectSnap.val();
                    subjectName = subjectData.displayName || 'Unknown User';
                } else {
                    subjectName = 'N/A (Failed to load user data)';
                }
            }
            return {
                timestamp: new Date(log.timestamp).toLocaleString(),
                action: log.action,
                performerName: performer ? performer.displayName : 'Unknown User',
                subjectName: subjectName,
            };
        }));

        return {
            room: room,
            roomId: params.roomId,
            members: members.sort((a, b) => a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0),
            isOwner: room.members[user.uid].role === 'owner',
            formattedLogs: formattedLogs.reverse(),
        };
    } catch (err) {
        console.error('Failed to load room data:', err);
        throw error(404, 'Room not found or access denied');
    }
};
