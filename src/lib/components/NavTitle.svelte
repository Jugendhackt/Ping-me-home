<script lang="ts">
	import { page } from "$app/state";

	let backLink: string | undefined = $state();
	let backLabel: string | undefined = $state();


	$effect(() => {
		switch(page.route.id) {
			case '/app/room/[roomId]':
				backLink = '/app/rooms';
				backLabel = 'Rooms';
				break;
			default:
				backLink = '/app';
				backLabel = 'Dashboard';
				break;
		}
	});
</script>

<a href={backLink} class="app-title" style="text-decoration: none; cursor: pointer;">
	{#if page.route.id === '/app'}
		Ping me Home!
	{:else}
		<span class="back-arrow">←</span> Back to {backLabel}
	{/if}
</a>

<style>
    .app-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-primary);
	}

    .back-arrow {
		position: relative;
		right: 0px;
		transition: right 0.1s ease-in-out;
	}

	a:hover .back-arrow {
		right: 7px;
	}

    @media (max-width: 768px) {		
		.app-title {
			font-size: 1.3rem;
		}
    }
</style>