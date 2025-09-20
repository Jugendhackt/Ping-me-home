<script lang="ts">
	interface Props {
		displayName: string;
		profileURL?: string;
		size?: 'small' | 'medium' | 'large';
	}

	let { displayName, profileURL = '', size = 'medium' }: Props = $props();

	// Generate a color based on the display name
	function getColorFromName(name: string): string {
		const colors = [
			'#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
			'#e67e22', '#1abc9c', '#34495e', '#e91e63', '#673ab7',
			'#607d8b', '#795548', '#ff5722', '#009688', '#4caf50'
		];
		
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		
		return colors[Math.abs(hash) % colors.length];
	}

	// Get the first letter or initials
	function getInitials(name: string): string {
		if (!name) return '?';
		
		const names = name.trim().split(' ');
		if (names.length === 1) {
			return names[0][0].toUpperCase();
		}
		
		return (names[0][0] + names[names.length - 1][0]).toUpperCase();
	}

	let backgroundColor = $derived(getColorFromName(displayName));
	let initials = $derived(getInitials(displayName));
	let sizeClass = $derived(`avatar-${size}`);
</script>

<div class="avatar {sizeClass}" style="background-color: {backgroundColor}">
	{#if profileURL}
		<img src={profileURL} alt="{displayName}'s avatar" class="avatar-image" />
	{:else}
		<span class="avatar-initials">{initials}</span>
	{/if}
</div>

<style>
	.avatar {
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		position: relative;
		overflow: hidden;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.avatar-small {
		width: 32px;
		height: 32px;
		font-size: 14px;
	}

	.avatar-medium {
		width: 40px;
		height: 40px;
		font-size: 16px;
	}

	.avatar-large {
		width: 64px;
		height: 64px;
		font-size: 24px;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.avatar-initials {
		user-select: none;
	}
</style>