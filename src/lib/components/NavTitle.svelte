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

{#if page.route.id === '/app'}
<span class="app-title">Ping me Home!</span>
{:else}
<a href={backLink} class="app-title" style="text-decoration: none; cursor: pointer;">
    <span class="back-arrow">←</span> Back to {backLabel}
</a>
{/if}

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
		right: 4px;
	}

    @media (max-width: 768px) {		
		.app-title {
			font-size: 1.3rem;
		}
    }
</style>
