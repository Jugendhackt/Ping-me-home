<script lang="ts">
	import type { PageData } from './$types';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
	import { checkIcon, closeIcon, crownIcon, inviteIcon } from '$lib/components/Icons.svelte';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { db } from '$lib/FirebaseConfig';
	import { ref, onValue, get, type Unsubscribe } from 'firebase/database';
	import type { User, Room } from '$lib/types';

	let { data }: { data: PageData } = $props();
	
	// Reactive state for real-time updates
	let currentUser = $state<User>(data.user);
	let pendingInvites = $state(data.pendingInvites);
	let isLoading = $state(false);
	let actionInProgress = $state<{ roomId: string; action: 'accept' | 'decline' } | null>(null);
	let unsubscribe: Unsubscribe | null = null;

	onMount(() => {
		// Set up real-time listener for user data
		const userRef = ref(db, `users/${data.user.uid}`);
		
		unsubscribe = onValue(userRef, async (snapshot) => {
			if (snapshot.exists()) {
				const userData = snapshot.val() as User;
				currentUser = userData;
				
				// Fetch updated invite data when pending invites change
				if (userData.pendingInvites) {
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
									uid => room.members[uid].role === 'owner'
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
					pendingInvites = updatedInvites.filter(invite => invite !== null);
				} else {
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
		if (isLoading || (actionInProgress?.roomId === roomId)) return;
		
		try {
			actionInProgress = { roomId, action: 'accept' };
			isLoading = true;
			
			const response = await fetch(`/api/room/${roomId}/accept-invite`, {
				method: 'POST'
			});
			
			if (response.ok) {
				// No need to reload, real-time listener will update the data
				console.log('Invite accepted successfully');
			} else {
				const error = await response.json();
				alert(`Error accepting invite: ${error.message || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error accepting invite:', error);
			alert('Failed to accept invite. Please try again.');
		} finally {
			actionInProgress = null;
			isLoading = false;
		}
	}

	async function handleDeclineInvite(roomId: string) {
		if (isLoading || (actionInProgress?.roomId === roomId)) return;
		
		try {
			actionInProgress = { roomId, action: 'decline' };
			isLoading = true;
			
			const response = await fetch(`/api/room/${roomId}/decline-invite`, {
				method: 'POST'
			});
			
			if (response.ok) {
				// No need to reload, real-time listener will update the data
				console.log('Invite declined successfully');
			} else {
				const error = await response.json();
				alert(`Error declining invite: ${error.message || 'Unknown error'}`);
			}
		} catch (error) {
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
	<div class="page-header">
		<div class="header-content">
			<div class="header-title">
				<div class="icon-wrapper">
					{@render inviteIcon('white')}
				</div>
				<div class="title-text">
					<h1>Your Inbox</h1>
					<p>Manage your pending room invitations</p>
				</div>
			</div>
			<button class="back-btn" onclick={goBack}>
				← Back to Dashboard
			</button>
		</div>
	</div>

	<div class="inbox-content">
		{#if pendingInvites.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					{@render inviteIcon('var(--text-muted)')}
				</div>
				<h2>No pending invites</h2>
				<p>You don't have any room invitations at the moment.</p>
				<button class="primary-btn" onclick={goBack}>
					Go to Dashboard
				</button>
			</div>
		{:else}
			<div class="invites-list">
				{#each pendingInvites as invite (invite.roomId)}
					<div class="invite-card">
						<div class="invite-info">
							<div class="room-details">
								<h3 class="room-name">{invite.room.name}</h3>
								{#if invite.owner}
									<div class="owner-info">
										<span class="owner-label">Invited by:</span>
										<div class="owner-details">
											<ProfileAvatar
												displayName={invite.owner.displayName || invite.owner.email?.split('@')[0] || 'User'}
												profileURL={invite.owner.profileURL || ''}
												size="small"
											/>
											<span class="owner-name">
												{invite.owner.displayName || invite.owner.email?.split('@')[0] || 'User'}
											</span>
											{@render crownIcon('var(--accent-color)')}
										</div>
									</div>
								{/if}
								<div class="room-meta">
									<span class="member-count">
										{Object.keys(invite.room.members).length} member{Object.keys(invite.room.members).length !== 1 ? 's' : ''}
									</span>
									{#if invite.room.allowUrlJoining}
										<span class="join-method">Public joining allowed</span>
									{:else}
										<span class="join-method">Invite only</span>
									{/if}
								</div>
							</div>
						</div>

						<div class="invite-actions">
							<button 
								class="decline-btn"
								onclick={() => handleDeclineInvite(invite.roomId)}
								disabled={isLoading || (actionInProgress?.roomId === invite.roomId)}
							>
								{#if actionInProgress?.roomId === invite.roomId && actionInProgress.action === 'decline'}
									<div class="loading-spinner"></div>
								{:else}
									{@render closeIcon('currentColor')}
								{/if}
								Decline
							</button>
							<button 
								class="accept-btn"
								onclick={() => handleAcceptInvite(invite.roomId)}
								disabled={isLoading || (actionInProgress?.roomId === invite.roomId)}
							>
								{#if actionInProgress?.roomId === invite.roomId && actionInProgress.action === 'accept'}
									<div class="loading-spinner"></div>
								{:else}
									{@render checkIcon('currentColor')}
								{/if}
								Accept
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
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		min-height: 100vh;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.icon-wrapper {
		background: var(--accent-color);
		border-radius: 16px;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-wrapper :global(svg) {
		fill: white;
	}

	.title-text h1 {
		margin: 0 0 0.25rem 0;
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.title-text p {
		margin: 0;
		color: var(--text-muted);
		font-size: 1rem;
	}

	.back-btn {
		background: var(--surface);
		color: var(--text-primary);
		border: 2px solid var(--border);
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: var(--surface-hover);
		border-color: var(--accent-color);
		transform: translateY(-2px);
	}

	.inbox-content {
		background: var(--surface);
		border-radius: 20px;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}

	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.empty-icon {
		background: var(--surface-hover);
		border-radius: 50%;
		padding: 2rem;
		margin-bottom: 1rem;
	}

	.empty-icon :global(svg) {
		width: 48px;
		height: 48px;
	}

	.empty-state h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--text-primary);
	}

	.empty-state p {
		margin: 0;
		color: var(--text-muted);
		max-width: 400px;
	}

	.primary-btn {
		background: var(--accent-color);
		color: white;
		border: none;
		padding: 0.875rem 2rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.2s ease;
		margin-top: 1rem;
	}

	.primary-btn:hover {
		background: var(--accent-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.invites-list {
		padding: 2rem;
	}

	.invite-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		padding: 1.5rem;
		background: var(--background);
		border: 2px solid var(--border);
		border-radius: 16px;
		margin-bottom: 1rem;
		transition: all 0.2s ease;
	}

	.invite-card:hover {
		border-color: var(--accent-color);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.invite-card:last-child {
		margin-bottom: 0;
	}

	.invite-info {
		flex: 1;
	}

	.room-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.room-name {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.owner-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.owner-label {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.owner-details {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.owner-name {
		font-weight: 600;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.room-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.room-meta span {
		font-size: 0.875rem;
		color: var(--text-muted);
		background: var(--surface-hover);
		padding: 0.25rem 0.75rem;
		border-radius: 8px;
	}

	.invite-actions {
		display: flex;
		gap: 1rem;
		flex-shrink: 0;
	}

	.accept-btn,
	.decline-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.2s ease;
		border: none;
		min-width: 120px;
		justify-content: center;
	}

	.accept-btn {
		background: var(--success-color, #22c55e);
		color: white;
	}

	.accept-btn:hover:not(:disabled) {
		background: var(--success-hover, #16a34a);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.decline-btn {
		background: var(--error-color, #ef4444);
		color: white;
	}

	.decline-btn:hover:not(:disabled) {
		background: var(--error-hover, #dc2626);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.accept-btn:disabled,
	.decline-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
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
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.inbox-page {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.invite-card {
			flex-direction: column;
			align-items: stretch;
			gap: 1.5rem;
		}

		.invite-actions {
			justify-content: stretch;
		}

		.accept-btn,
		.decline-btn {
			flex: 1;
		}
	}

	@media (max-width: 480px) {
		.title-text h1 {
			font-size: 1.5rem;
		}

		.header-title {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.icon-wrapper {
			padding: 0.75rem;
		}
	}
</style>