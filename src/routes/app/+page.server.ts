import { db } from "$lib/FirebaseConfig";
import type { User } from "$lib/types";
import { get, ref } from "firebase/database";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Get the user data from the layout
	const { user } = await parent();
	
	// Fetch full user data to get pendingInvites
	const userRef = ref(db, `users/${user.uid}`);
	const userSnapshot = await get(userRef);
	const userData = userSnapshot.exists() ? userSnapshot.val() as User : user;
	
	return {
		user: userData
	};
};
