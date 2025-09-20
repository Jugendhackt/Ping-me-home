import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Get the user data from the layout
	const { user } = await parent();
	
	return {
		user
	};
};
