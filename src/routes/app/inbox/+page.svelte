<script lang="ts">
	import type { PageData } from './$types';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
	import { checkIcon, closeIcon, crownIcon, inviteIcon } from '$lib/components/Icons.svelte';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { fly, scale, fade } from 'svelte/transition';
	import { db } from '$lib/FirebaseConfig';
	import { ref, onValue, get, type Unsubscribe } from 'firebase/database';
	import type { User, Room } from '$lib/types';

	let { data }: { data: PageData } = $props();

	// Reactive state for real-time updates
	let currentUser = $state<User>(data.user);
	let pendingInvites = $state<
		{
			roomId: string;
			room: Room;
			owner: {
				uid: string;
				displayName?: string | null;
				email?: string | null;
				profileURL?: string | null;
			} | null;
		}[]
	>(data.pendingInvites);
	let isLoading = $state(false);
	let actionInProgress = $state<{ roomId: string; action: 'accept' | 'decline' } | null>(null);
	let unsubscribe: Unsubscribe | null = null;

	onMount(() => {
		// Set up real-time listener for user data
		const userRef = ref(db, `users/${data.user.uid}`);

		unsubscribe = onValue(userRef, async (snapshot) => {
			// Skip real-time updates during user actions to prevent race conditions
			if (actionInProgress || isLoading) {
				console.log('Skipping real-time update during action');
				return;
			}

			if (snapshot.exists()) {
				const userData = snapshot.val() as User;
				currentUser = userData;

				console.log('User data updated:', userData.pendingInvites);

				// Fetch updated invite data when pending invites change
				if (userData.pendingInvites && userData.pendingInvites.length > 0) {
					console.log('Processing pending invites:', userData.pendingInvites);
					const updatedInvites = await Promise.all(
						userData.pendingInvites.map(async (roomId: string) => {
							try {
								const roomRef = ref(db, `rooms/${roomId}`);
								const roomSnapshot = await get(roomRef);

								if (!roomSnapshot.exists()) {
									return null;
								}

								const room = roomSnapshot.val() as Room;

								// Find the owner of the room
								const ownerUid = Object.keys(room.members).find(
									(uid) => room.members[uid].role === 'owner'
								);

								let ownerData = null;
								if (ownerUid) {
									const ownerRef = ref(db, `users/${ownerUid}`);
									const ownerSnapshot = await get(ownerRef);
									if (ownerSnapshot.exists()) {
										ownerData = ownerSnapshot.val() as User;
									}
								}

								return {
									roomId,
									room,
									owner: ownerData
								};
							} catch (error) {
								console.error(`Error fetching room ${roomId}:`, error);
								return null;
							}
						})
					);

					// Filter out null results (rooms that don't exist)
					pendingInvites = updatedInvites.filter((invite) => invite !== null);
					console.log('Updated pending invites:', pendingInvites);
				} else {
					// Clear invites if no pending invites exist
					console.log('No pending invites, clearing list');
					pendingInvites = [];
				}
			}
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	async function handleAcceptInvite(roomId: string) {
		if (isLoading || actionInProgress?.roomId === roomId) return;

		// Store original invites for rollback if needed
		const originalInvites = [...pendingInvites];

		try {
			actionInProgress = { roomId, action: 'accept' };
			isLoading = true;

			// Optimistically remove the invite from UI for better UX
			pendingInvites = pendingInvites.filter((invite) => invite.roomId !== roomId);

			const response = await fetch(`/api/room/${roomId}/accept-invite`, {
				method: 'POST'
			});

			if (response.ok) {
				console.log('Invite accepted successfully and removed from UI');
				// Invite already removed optimistically, no need to do it again
			} else {
				// Rollback on error
				pendingInvites = originalInvites;
				const error = await response.json();
				alert(`Error accepting invite: ${error.message || 'Unknown error'}`);
			}
		} catch (error) {
			// Rollback on error
			pendingInvites = originalInvites;
			console.error('Error accepting invite:', error);
			alert('Failed to accept invite. Please try again.');
		} finally {
			actionInProgress = null;
			isLoading = false;
		}
	}

	async function handleDeclineInvite(roomId: string) {
		if (isLoading || actionInProgress?.roomId === roomId) return;

		// Store original invites for rollback if needed
		const originalInvites = [...pendingInvites];

		try {
			actionInProgress = { roomId, action: 'decline' };
			isLoading = true;

			// Optimistically remove the invite from UI for better UX
			pendingInvites = pendingInvites.filter((invite) => invite.roomId !== roomId);

			const response = await fetch(`/api/room/${roomId}/decline-invite`, {
				method: 'POST'
			});

			if (response.ok) {
				console.log('Invite declined successfully and removed from UI');
				// Invite already removed optimistically, no need to do it again
			} else {
				// Rollback on error
				pendingInvites = originalInvites;
				const error = await response.json();
				alert(`Error declining invite: ${error.message || 'Unknown error'}`);
			}
		} catch (error) {
			// Rollback on error
			pendingInvites = originalInvites;
			console.error('Error declining invite:', error);
			alert('Failed to decline invite. Please try again.');
		} finally {
			actionInProgress = null;
			isLoading = false;
		}
	}

	function goBack() {
		goto('/app');
	}
</script>

<svelte:head>
	<title>Inbox - JHCGN</title>
	<meta name="description" content="Your pending room invites" />
</svelte:head>

<div class="inbox-page">
	<!-- Animated background particles -->
	<div class="particles-background">
		<div class="particle particle-1"></div>
		<div class="particle particle-2"></div>
		<div class="particle particle-3"></div>
		<div class="particle particle-4"></div>
	</div>

	<div class="page-header" in:fly={{ y: -50, duration: 800, delay: 100 }}>
		<div class="header-content">
			<div class="header-title">
				<div class="icon-wrapper">
					<div class="icon-glow"></div>
					{@render inviteIcon('currentColor')}
				</div>
				<div class="title-text">
					<h1>
						<span class="gradient-text">Your Inbox</span>
						{#if pendingInvites.length > 0}
							<span class="invite-badge" in:scale={{ duration: 500, delay: 600 }}>
								{pendingInvites.length}
							</span>
						{/if}
					</h1>
					<p>Manage your pending room invitations with style</p>
				</div>
			</div>
			<button
				class="back-btn glass-effect"
				onclick={goBack}
				in:fly={{ x: 50, duration: 600, delay: 400 }}
			>
				<span>←</span>
				Dashboard
			</button>
		</div>
	</div>

	<div class="inbox-content" in:fade={{ duration: 600, delay: 200 }}>
		{#if pendingInvites.length === 0}
			<div class="empty-state" in:fly={{ y: 50, duration: 800, delay: 400 }}>
				<div class="empty-illustration">
					<div class="floating-envelope">
						<div class="envelope-glow"></div>
						{@render inviteIcon('white')}
					</div>
					<div class="floating-particles">
						<div class="float-particle float-1">✨</div>
						<div class="float-particle float-2">💌</div>
						<div class="float-particle float-3">⭐</div>
					</div>
				</div>
				<div class="empty-content">
					<h2>Your inbox is sparkling clean!</h2>
					<p>
						No pending invitations right now. When someone invites you to a room, you'll see it
						here.
					</p>
					<button class="primary-btn glass-effect" onclick={goBack}>
						<span class="btn-content">
							<span>✨</span>
							Go to Dashboard
						</span>
					</button>
				</div>
			</div>
		{:else}
			<div class="invites-list">
				{#each pendingInvites as invite, index (invite.roomId)}
					<div
						class="invite-card glass-effect"
						in:fly={{ y: 50, duration: 600, delay: 500 + index * 100 }}
					>
						<div class="card-glow"></div>
						<div class="invite-header">
							<div class="room-icon">
								<div class="room-icon-bg"></div>
								<span class="room-initial">{invite.room.name.charAt(0).toUpperCase()}</span>
							</div>
							<div class="invite-status">
								<span class="status-indicator pulsing"></span>
								New Invite
							</div>
						</div>

						<div class="invite-info">
							<div class="room-details">
								<h3 class="room-name gradient-text">{invite.room.name}</h3>
								{#if invite.owner}
									<div class="owner-info">
										<span class="owner-label">Invited by:</span>
										<div class="owner-details">
											<div class="avatar-wrapper">
												<ProfileAvatar
													displayName={invite.owner.displayName ||
														invite.owner.email?.split('@')[0] ||
														'User'}
													profileURL={invite.owner.profileURL || ''}
													size="small"
												/>
											</div>
											<span class="owner-name">
												{invite.owner.displayName || invite.owner.email?.split('@')[0] || 'User'}
											</span>
											<div class="crown-icon">
												{@render crownIcon('gold')}
											</div>
										</div>
									</div>
								{/if}
								<div class="room-meta">
									<div class="meta-item">
										<span class="meta-icon">👥</span>
										<span class="meta-value">
											{Object.values(invite.room.members).filter(
												(member) => member.role !== 'invited'
											).length} member{Object.values(invite.room.members).filter(
												(member) => member.role !== 'invited'
											).length !== 1
												? 's'
												: ''}
										</span>
									</div>
									<div class="meta-item">
										<span class="meta-icon">{invite.room.allowUrlJoining ? '🌐' : '🔒'}</span>
										<span class="meta-value">
											{#if invite.room.allowUrlJoining}
												Public joining
											{:else}
												Invite only
											{/if}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div class="invite-actions">
							<button
								class="decline-btn glass-effect"
								onclick={() => handleDeclineInvite(invite.roomId)}
								disabled={isLoading || actionInProgress?.roomId === invite.roomId}
							>
								<span class="btn-content">
									{#if actionInProgress?.roomId === invite.roomId && actionInProgress.action === 'decline'}
										<div class="loading-spinner"></div>
									{:else}
										{@render closeIcon('currentColor')}
									{/if}
									<span>Decline</span>
								</span>
							</button>
							<button
								class="accept-btn glass-effect"
								onclick={() => handleAcceptInvite(invite.roomId)}
								disabled={isLoading || actionInProgress?.roomId === invite.roomId}
							>
								<span class="btn-content">
									{#if actionInProgress?.roomId === invite.roomId && actionInProgress.action === 'accept'}
										<div class="loading-spinner"></div>
									{:else}
										{@render checkIcon('currentColor')}
									{/if}
									<span>Accept</span>
								</span>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.inbox-page {
		--gradient-primary: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
		--gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		--gradient-success: linear-gradient(135deg, var(--success-color) 0%, #00f2fe 100%);
		--gradient-danger: linear-gradient(135deg, var(--error-color) 0%, #fee140 100%);
		--glass-bg: rgba(255, 255, 255, 0.05);
		--glass-border: rgba(255, 255, 255, 0.1);
		--glass-bg-hover: rgba(255, 255, 255, 0.08);
		--shadow-glow: 0 8px 32px rgba(102, 126, 234, 0.15);
		--shadow-intense: 0 20px 40px rgba(0, 0, 0, 0.1);
		--glow-opacity: 0.3;
		--particle-opacity: 0.06;
	}

	/* Dark mode adjustments */
	:global([data-theme="dark"]) .inbox-page {
		--glass-bg: rgba(0, 0, 0, 0.2);
		--glass-border: rgba(255, 255, 255, 0.1);
		--glass-bg-hover: rgba(255, 255, 255, 0.05);
		--shadow-glow: 0 8px 32px rgba(139, 92, 246, 0.2);
		--shadow-intense: 0 20px 40px rgba(0, 0, 0, 0.3);
		--glow-opacity: 0.2;
		--particle-opacity: 0.04;
	}

	.inbox-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		min-height: 100vh;
		position: relative;
		overflow: hidden;
	}

	/* Animated background particles */
	.particles-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: -1;
	}

	.particle {
		position: absolute;
		background: var(--gradient-primary);
		border-radius: 50%;
		animation: float 6s ease-in-out infinite;
	}

	.particle-1 {
		width: 60px;
		height: 60px;
		top: 10%;
		left: 10%;
		animation-delay: 0s;
		opacity: var(--particle-opacity);
	}

	.particle-2 {
		width: 40px;
		height: 40px;
		top: 60%;
		right: 15%;
		animation-delay: -2s;
		opacity: var(--particle-opacity);
	}

	.particle-3 {
		width: 80px;
		height: 80px;
		bottom: 20%;
		left: 70%;
		animation-delay: -4s;
		opacity: calc(var(--particle-opacity) * 0.8);
	}

	.particle-4 {
		width: 30px;
		height: 30px;
		top: 30%;
		right: 40%;
		animation-delay: -1s;
		opacity: calc(var(--particle-opacity) * 1.2);
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		33% {
			transform: translateY(-30px) rotate(120deg);
		}
		66% {
			transform: translateY(15px) rotate(240deg);
		}
	}

	/* Glass effect utility */
	.glass-effect {
		background: var(--glass-bg);
		backdrop-filter: blur(16px) saturate(1.2);
		-webkit-backdrop-filter: blur(16px) saturate(1.2);
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-glow);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.glass-effect:hover {
		background: var(--glass-bg-hover);
		box-shadow: var(--shadow-intense);
	}

	.page-header {
		margin-bottom: 3rem;
		position: relative;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.icon-wrapper {
		position: relative;
		background: var(--gradient-primary);
		border-radius: 20px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-glow);
		transform: perspective(500px) rotateX(15deg);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.icon-wrapper:hover {
		transform: perspective(500px) rotateX(0deg) translateY(-5px);
		box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
	}

	.icon-glow {
		position: absolute;
		inset: -8px;
		background: var(--gradient-primary);
		border-radius: 25px;
		filter: blur(16px);
		opacity: var(--glow-opacity);
		z-index: -1;
		animation: pulse-glow 4s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: calc(var(--glow-opacity) * 0.8);
			transform: scale(0.95);
		}
		50% {
			opacity: var(--glow-opacity);
			transform: scale(1);
		}
	}

	.icon-wrapper :global(svg) {
		color: white;
		width: 32px;
		height: 32px;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
	}

	:global([data-theme="dark"]) .icon-wrapper :global(svg) {
		color: white;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
	}

	/* Primary Button Styling */
	.primary-btn.glass-effect {
		background: var(--gradient-primary) !important;
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 15px;
		cursor: pointer;
		font-size: 1.1rem;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
		position: relative;
		overflow: hidden;
	}

	:global([data-theme="dark"]) .primary-btn.glass-effect {
		background: var(--gradient-primary) !important;
		box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
	}

	.primary-btn.glass-effect:hover {
		background: var(--gradient-primary) !important;
		transform: translateY(-3px);
		box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
	}

	:global([data-theme="dark"]) .primary-btn.glass-effect:hover {
		background: var(--gradient-primary) !important;
		box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
	}

	.title-text h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		gap: 1rem;
		line-height: 1.2;
	}

	.gradient-text {
		background: var(--gradient-primary);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 200%;
		animation: gradient-shift 3s ease infinite;
	}

	@keyframes gradient-shift {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.invite-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		background: var(--gradient-danger);
		color: white;
		border-radius: 1rem;
		font-size: 0.9rem;
		font-weight: 700;
		box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
		animation: bounce-gentle 2s ease-in-out infinite;
	}

	@keyframes bounce-gentle {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	.title-text p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 1.1rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.back-btn {
		padding: 1rem 1.5rem;
		border-radius: 15px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: none;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	.back-btn::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--gradient-primary);
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: 15px;
	}

	.back-btn:hover::before {
		opacity: 0.08;
	}

	.back-btn:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-intense);
		color: var(--accent-color);
	}

	.back-btn span:first-child {
		font-size: 1.2rem;
		transition: transform 0.3s ease;
	}

	.back-btn:hover span:first-child {
		transform: translateX(-3px);
	}

	.inbox-content {
		position: relative;
	}

	/* Empty State Styling */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		position: relative;
	}

	.empty-illustration {
		position: relative;
		display: inline-block;
		margin-bottom: 2rem;
	}

	.floating-envelope {
		position: relative;
		width: 120px;
		height: 120px;
		margin: 0 auto 2rem;
		background: var(--gradient-primary);
		border-radius: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: hover-float 3s ease-in-out infinite;
		box-shadow: var(--shadow-glow);
	}

	.envelope-glow {
		position: absolute;
		inset: -12px;
		background: var(--gradient-primary);
		border-radius: 40px;
		filter: blur(24px);
		opacity: calc(var(--glow-opacity) * 0.8);
		z-index: -1;
		animation: pulse-glow 3s ease-in-out infinite;
	}

	.floating-envelope :global(svg) {
		width: 50px;
		height: 50px;
		color: white;
		filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3));
		z-index: 1;
		position: relative;
	}

	@keyframes hover-float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-10px) rotate(2deg);
		}
	}

	.floating-particles {
		position: absolute;
		inset: -50px;
		pointer-events: none;
	}

	.float-particle {
		position: absolute;
		font-size: 1.5rem;
		animation: particle-float 4s ease-in-out infinite;
	}

	.float-1 {
		top: 20%;
		left: 10%;
		animation-delay: 0s;
	}

	.float-2 {
		top: 70%;
		right: 15%;
		animation-delay: -1.5s;
	}

	.float-3 {
		bottom: 20%;
		left: 80%;
		animation-delay: -3s;
	}

	@keyframes particle-float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
			opacity: 0.7;
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
			opacity: 1;
		}
	}

	.empty-content h2 {
		margin: 0 0 1rem 0;
		font-size: 1.8rem;
		font-weight: 700;
		background: var(--gradient-primary);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.empty-content p {
		margin: 0 0 2rem 0;
		color: var(--text-secondary);
		font-size: 1.1rem;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	.primary-btn:active {
		transform: translateY(-1px);
	}

	.btn-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		z-index: 1;
	}

	/* Invite Cards Styling */
	.invites-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 1rem;
	}

	.invite-card {
		position: relative;
		border-radius: 24px;
		padding: 2rem;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.invite-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--gradient-primary);
		opacity: 0;
		transition: opacity 0.4s ease;
		z-index: -1;
		border-radius: 24px;
	}

	.invite-card:hover::before {
		opacity: 0.03;
	}

	.invite-card:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 25px 50px rgba(102, 126, 234, 0.25);
		border-color: rgba(102, 126, 234, 0.3);
	}

	.card-glow {
		position: absolute;
		inset: -1px;
		background: var(--gradient-primary);
		border-radius: 26px;
		filter: blur(16px);
		opacity: 0;
		transition: opacity 0.4s ease;
		z-index: -2;
	}

	.invite-card:hover .card-glow {
		opacity: calc(var(--glow-opacity) * 0.6);
	}

	.invite-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.room-icon {
		position: relative;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 18px;
		background: var(--gradient-secondary);
		box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
	}

	.room-icon-bg {
		position: absolute;
		inset: -4px;
		background: var(--gradient-secondary);
		border-radius: 23px;
		filter: blur(12px);
		opacity: calc(var(--glow-opacity) * 0.8);
		z-index: -1;
	}

	.room-initial {
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.invite-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		padding: 0.5rem 1rem;
		border-radius: 12px;
		font-size: 0.9rem;
		font-weight: 600;
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		background: #22c55e;
		border-radius: 50%;
	}

	.pulsing {
		animation: pulse-indicator 2s ease-in-out infinite;
	}

	@keyframes pulse-indicator {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}

	.invite-info {
		margin-bottom: 2rem;
	}

	.room-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.room-name {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.owner-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.owner-label {
		font-size: 0.9rem;
		color: var(--text-secondary);
		font-weight: 600;
		opacity: 0.8;
	}

	.owner-details {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.avatar-wrapper {
		position: relative;
	}

	.avatar-wrapper::after {
		content: '';
		position: absolute;
		inset: -2px;
		background: var(--gradient-primary);
		border-radius: 50%;
		z-index: -1;
		opacity: calc(var(--glow-opacity) * 0.7);
		filter: blur(4px);
	}

	.owner-name {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 1rem;
	}

	.crown-icon {
		display: flex;
		align-items: center;
	}

	.crown-icon :global(svg) {
		width: 20px;
		height: 20px;
		filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.5));
	}

	.room-meta {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(102, 126, 234, 0.1);
		padding: 0.5rem 1rem;
		border-radius: 12px;
		border: 1px solid rgba(102, 126, 234, 0.2);
	}

	.meta-icon {
		font-size: 1rem;
	}

	.meta-value {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	/* Action Buttons */
	.invite-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.accept-btn,
	.decline-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		border-radius: 15px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: none;
		min-width: 120px;
		position: relative;
		overflow: hidden;
	}

	.accept-btn {
		background: var(--gradient-success);
		color: white;
		box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
	}

	.accept-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 12px 30px rgba(79, 172, 254, 0.4);
	}

	.decline-btn {
		background: var(--glass-bg);
		color: var(--text-primary);
		border: 1px solid var(--glass-border);
	}

	.decline-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
		color: #ef4444;
		box-shadow: 0 12px 30px rgba(239, 68, 68, 0.2);
	}

	.accept-btn:disabled,
	.decline-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
		box-shadow: none !important;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.inbox-page {
			padding: 1.5rem;
		}

		.header-content {
			gap: 1.5rem;
		}

		.title-text h1 {
			font-size: 2.2rem;
		}
	}

	@media (max-width: 768px) {
		.inbox-page {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.5rem;
		}

		.header-title {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.title-text h1 {
			font-size: 2rem;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.back-btn {
			align-self: stretch;
			justify-content: center;
		}

		.invite-card {
			padding: 1.5rem;
		}

		.invite-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.invite-actions {
			flex-direction: column;
			gap: 0.75rem;
		}

		.accept-btn,
		.decline-btn {
			width: 100%;
			justify-content: center;
		}

		.room-meta {
			flex-direction: column;
			gap: 0.75rem;
		}

		.meta-item {
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.title-text h1 {
			font-size: 1.8rem;
		}

		.icon-wrapper {
			padding: 1rem;
			border-radius: 16px;
		}

		.icon-wrapper :global(svg) {
			width: 24px;
			height: 24px;
		}

		.room-icon {
			width: 50px;
			height: 50px;
		}

		.room-initial {
			font-size: 1.2rem;
		}

		.empty-state {
			padding: 2rem 1rem;
		}

		.floating-envelope {
			width: 100px;
			height: 100px;
		}

		.floating-envelope :global(svg) {
			width: 40px;
			height: 40px;
		}
	}
</style>
