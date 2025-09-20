<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { gridViewIcon, listViewIcon, searchIcon } from '$lib/components/Icons.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let viewMode = $state<'grid' | 'list'>('grid');
	let deletingRoomId: string | null = $state(null);
	let searchQuery = $state('');

	// Modal state
	let showCreateModal = $state(false);
	let isCreating = $state(false);
	let newRoomName = $state('');
	let allowUrlJoining = $state(true);

	// Filter rooms based on search query
	let filteredRooms = $derived(data.rooms.filter(room => 
		room.name.toLowerCase().includes(searchQuery.toLowerCase())
	));

	async function deleteRoom(roomId: string, roomName: string) {
		if (
			!confirm(
				`Are you sure you want to delete the room "${roomName}"? This action cannot be undone.`
			)
		) {
			return;
		}

		deletingRoomId = roomId;

		try {
			const response = await fetch(`/api/room/${roomId}/delete`, {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to delete room');
			}

			// Reload the page to refresh the room list
			goto($page.url.pathname, { invalidateAll: true });
		} catch (error) {
			console.error('Error deleting room:', error);
			alert(`Failed to delete room: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			deletingRoomId = null;
		}
	}

	async function createRoom() {
		if (!newRoomName.trim()) return;

		isCreating = true;

		try {
			const response = await fetch('/api/rooms/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: newRoomName.trim(),
					allowUrlJoining: allowUrlJoining
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to create room');
			}

			await response.json();
			
			// Reset form and close modal
			newRoomName = '';
			allowUrlJoining = true;
			showCreateModal = false;

			// Reload the page to show the new room
			goto($page.url.pathname, { invalidateAll: true });
		} catch (error) {
			console.error('Error creating room:', error);
			alert(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isCreating = false;
		}
	}

	function openCreateModal() {
		newRoomName = '';
		allowUrlJoining = true;
		showCreateModal = true;
	}

	function closeCreateModal() {
		if (isCreating) return; // Prevent closing while creating
		showCreateModal = false;
		newRoomName = '';
		allowUrlJoining = true;
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeCreateModal();
		}
	}

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			closeCreateModal();
		}
	}

	function getRoleDisplayName(role: string): string {
		switch (role) {
			case 'owner': return 'Owner';
			case 'member': return 'Member';
			case 'invited': return 'Invited';
			default: return role;
		}
	}

	function getRoleClass(role: string): string {
		switch (role) {
			case 'owner': return 'role-owner';
			case 'member': return 'role-member';
			case 'invited': return 'role-invited';
			default: return 'role-default';
		}
	}

	function sortRoomsByRole(rooms: typeof data.rooms) {
		const rolePriority: { [role: string]: number } = { 'owner': 3, 'member': 2, 'invited': 1 } as const;
		return [...rooms].sort((a, b) => {
			const priorityDiff = rolePriority[b.role] - rolePriority[a.role];
			if (priorityDiff !== 0) return priorityDiff;
			return a.name.localeCompare(b.name);
		});
	}

	let sortedRooms = $derived(sortRoomsByRole(filteredRooms));
</script>

<svelte:head>
	<title>My Rooms - Ping Me Home</title>
</svelte:head>

<div class="rooms-page">
	<!-- Page Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="title-section">
				<h1>My Rooms</h1>
				<p>Manage and browse your room memberships</p>
			</div>
			<div class="header-actions">
				<button onclick={openCreateModal} class="btn btn-primary">
					Create Room
				</button>
			</div>
		</div>
	</div>

	<!-- Controls Section -->
	<div class="controls-section">
		<div class="search-bar">
			<div class="search-input-wrapper">
				<span class="search-icon align-center">{@render searchIcon()}</span>
				<input 
					type="text" 
					placeholder="Search rooms..." 
					class="search-input"
					bind:value={searchQuery}
				/>
			</div>
		</div>
		
		<div class="view-controls">
			<button 
				class="view-toggle align-center"
				class:active={viewMode === 'grid'}
				onclick={() => viewMode = 'grid'}
				aria-label="Grid view"
			>
				{@render gridViewIcon()}
			</button>
			<button 
				class="view-toggle align-center"
				class:active={viewMode === 'list'}
				onclick={() => viewMode = 'list'}
				aria-label="List view"
			>
				{@render listViewIcon()}
			</button>
		</div>
	</div>

	<!-- Rooms Content -->
	{#if data.rooms.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🏠</div>
			<h2>No rooms yet</h2>
			<p>
				You're not a member of any rooms yet. Create your first room or ask someone to invite you!
			</p>
			<button onclick={openCreateModal} class="btn btn-primary">Create Your First Room</button>
		</div>
	{:else if sortedRooms.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🔍</div>
			<h2>No rooms found</h2>
			<p>No rooms match your search criteria. Try adjusting your search.</p>
		</div>
	{:else}
		<div class="rooms-container" class:list-view={viewMode === 'list'} class:grid-view={viewMode === 'grid'}>
			{#each sortedRooms as room (room.roomId)}
				<div class="room-card">
					<div class="room-header">
						<div class="room-title">
							<h3 class="room-name">{room.name}</h3>
							<div class="room-role {getRoleClass(room.role)}">
								<span class="role-text">{getRoleDisplayName(room.role)}</span>
							</div>
						</div>
					</div>

					<div class="room-info">
						<div class="info-item info-members">
							<span class="info-text">{room.memberCount} member{room.memberCount !== 1 ? 's' : ''}</span>
						</div>
						{#if room.allowUrlJoining}
							<div class="info-item info-public">
								<span class="info-text">Public</span>
							</div>
						{/if}
					</div>

					<div class="room-actions">
						<a href="/app/room/{room.roomId}" class="btn btn-secondary">
							{#if room.role === 'invited'}
								View Invite
							{:else}
								Enter Room
							{/if}
						</a>

						{#if room.role === 'owner'}
							<button
								class="btn btn-danger"
								disabled={deletingRoomId === room.roomId}
								onclick={() => deleteRoom(room.roomId, room.name)}
							>
								{#if deletingRoomId === room.roomId}
									Deleting...
								{:else}
									Delete
								{/if}
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Room Modal -->
{#if showCreateModal}
	<div class="modal-backdrop" onclick={closeCreateModal} onkeydown={handleBackdropKeydown} role="dialog" aria-modal="true" tabindex="-1">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={handleModalKeydown} role="document"  tabindex="0">
			<div class="modal-header">
				<h2>Create New Room</h2>
				<button class="modal-close" onclick={closeCreateModal} aria-label="Close modal">✕</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); createRoom(); }} class="modal-form">
				<div class="form-group">
					<label for="room-name">Room Name</label>
					<input 
						id="room-name"
						type="text" 
						bind:value={newRoomName}
						placeholder="Enter room name..."
						required
						maxlength="50"
						disabled={isCreating}
						class="form-input"
					/>
				</div>

				<div class="form-group">
					<label class="checkbox-label">
						<input 
							type="checkbox" 
							bind:checked={allowUrlJoining}
							disabled={isCreating}
							class="checkbox-input"
						/>
						<span class="checkbox-custom"></span>
						<span class="checkbox-text">
							Allow anyone to join with a link
							<small>People can join this room using a URL without an invitation</small>
						</span>
					</label>
				</div>

				<div class="modal-actions">
					<button 
						type="button" 
						onclick={closeCreateModal}
						disabled={isCreating}
						class="btn btn-secondary"
					>
						Cancel
					</button>
					<button 
						type="submit"
						disabled={isCreating || !newRoomName.trim()}
						class="btn btn-primary"
					>
						{#if isCreating}
							Creating...
						{:else}
							Create Room
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Main container */
	.rooms-page {
		min-height: calc(100vh - 80px);
		color: var(--text-primary);
	}

	/* Page Header */
	.page-header {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		box-shadow: var(--shadow-sm);
		margin-bottom: 2rem;
	}

	.header-content {
		padding: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
	}

	.title-section h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.title-section p {
		color: var(--text-secondary);
		margin: 0;
		font-size: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	/* Controls Section */
	.controls-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.search-bar {
		flex: 1;
		max-width: 400px;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		font-size: 1rem;
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.5rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.view-controls {
		display: flex;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 4px;
	}

	.view-toggle {
		background: none;
		border: none;
		padding: 8px 12px;
		cursor: pointer;
		color: var(--text-secondary);
		font-size: 1.1rem;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.view-toggle:hover {
		color: var(--text-primary);
		background: var(--bg-hover);
	}

	.view-toggle.active {
		color: var(--accent-color);
		background: var(--accent-light);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		margin: 2rem auto;
		max-width: 500px;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1.5rem;
		opacity: 0.7;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.empty-state p {
		color: var(--text-secondary);
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	/* Rooms Container */
	.rooms-container {
		transition: all 0.3s ease;
	}

	.rooms-container.grid-view {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.rooms-container.list-view {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Room Cards */
	.room-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		padding: 1.75rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	.room-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--accent-color), #4338ca);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.room-card:hover::before {
		opacity: 1;
	}

	.room-card:hover {
		border-color: var(--border-hover);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.15);
		transform: translateY(-4px);
	}

	.list-view .room-card {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.25rem 1.5rem;
	}

	.list-view .room-header {
		flex: 1;
		margin-bottom: 0;
	}

	.list-view .room-info {
		margin-bottom: 0;
		flex-shrink: 0;
	}

	.list-view .room-actions {
		flex-shrink: 0;
		margin-left: auto;
	}

	/* Room Header */
	.room-header {
		margin-bottom: 1rem;
	}

	.room-title {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.room-name {
		font-size: 1.375rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		word-break: break-word;
		flex: 1;
		line-height: 1.3;
		background: var(--text-gradient);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.room-role {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.8rem;
		border-radius: 12px;
		white-space: nowrap;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		border: 1px solid;
	}

	.role-owner {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: #1f2937;
		border-color: #d97706;
	}

	.role-member {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
		color: white;
		border-color: #2563eb;
	}

	.role-invited {
		background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
		color: white;
		border-color: #059669;
	}

	.role-default {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		border-color: var(--border-color);
	}

	.role-icon {
		font-size: 0.9rem;
	}

	.role-text {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.025em;
	}

	/* Room Info */
	.room-info {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bg-tertiary);
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--border-color);
		font-size: 0.8rem;
		font-weight: 500;
	}

	.info-members {
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		border-color: #d1d5db;
		color: #374151;
	}

	.info-public {
		background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
		border-color: #86efac;
		color: #166534;
	}

	.info-icon {
		font-size: 0.9rem;
	}

	.info-text {
		font-size: 0.8rem;
		font-weight: 500;
	}

	/* Action Buttons */
	.room-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		background: var(--bg-tertiary);
		color: var(--text-primary);
		position: relative;
		overflow: hidden;
		min-height: 40px;
	}

	.btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.5s;
	}

	.btn:hover::before {
		left: 100%;
	}

	.btn:hover {
		border-color: var(--border-hover);
		background: var(--bg-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--accent-color) 0%, #4338ca 100%);
		color: white;
		border-color: var(--accent-color);
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, var(--accent-hover) 0%, #3730a3 100%);
		border-color: var(--accent-hover);
		box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
	}

	.btn-secondary {
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
		border-color: var(--border-color);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.btn-secondary:hover {
		background: linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-secondary) 100%);
	}

	.btn-danger {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		border-color: #ef4444;
		box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
	}

	.btn-danger:hover {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		border-color: #dc2626;
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn:disabled:hover {
		transform: none;
		box-shadow: none;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: stretch;
			gap: 1.5rem;
			padding: 1.5rem;
		}

		.controls-section {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.search-bar {
			max-width: none;
		}

		.view-controls {
			align-self: flex-end;
		}

		.rooms-container.grid-view {
			grid-template-columns: 1fr;
		}

		.list-view .room-card {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.list-view .room-actions {
			margin-left: 0;
		}

		.room-title {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.room-role {
			align-self: flex-start;
		}

		.room-actions {
			flex-direction: column;
		}

		.btn {
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.page-header {
			margin-bottom: 1.5rem;
		}

		.header-content {
			padding: 1rem;
		}

		.title-section h1 {
			font-size: 1.5rem;
		}

		.room-card {
			padding: 1rem;
		}

		.empty-state {
			padding: 2rem 1rem;
		}

		.empty-icon {
			font-size: 3rem;
		}
	}

	/* Modal Styles */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: var(--shadow-lg);
		animation: modalSlideIn 0.2s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(-20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-header {
		padding: 1.5rem 1.5rem 0 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.modal-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
		transition: all 0.2s ease;
		line-height: 1;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-close:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.modal-form {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 1rem;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input::placeholder {
		color: var(--text-muted);
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
		font-weight: normal;
		margin-bottom: 0;
		line-height: 1.5;
	}

	.checkbox-input {
		display: none;
	}

	.checkbox-custom {
		width: 18px;
		height: 18px;
		border: 2px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-secondary);
		transition: all 0.2s ease;
		flex-shrink: 0;
		position: relative;
		margin-top: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.checkbox-input:checked + .checkbox-custom {
		background: var(--accent-color);
		border-color: var(--accent-color);
	}

	.checkbox-input:checked + .checkbox-custom::after {
		content: '✓';
		color: white;
		font-size: 11px;
		font-weight: bold;
		line-height: 1;
	}

	.checkbox-input:disabled + .checkbox-custom {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.checkbox-text {
		flex: 1;
		line-height: 1.5;
		margin-top: 1px;
	}

	.checkbox-text small {
		display: block;
		color: var(--text-muted);
		font-size: 0.8rem;
		margin-top: 0.25rem;
		line-height: 1.4;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}

	.modal-actions .btn {
		min-width: 120px;
		justify-content: center;
	}

	/* Modal responsive design */
	@media (max-width: 520px) {
		.modal-content {
			margin: 0;
			border-radius: 16px 16px 0 0;
			max-height: 85vh;
		}

		.modal-actions {
			flex-direction: column-reverse;
		}

		.modal-actions .btn {
			width: 100%;
			min-width: auto;
		}
	}

	.align-center {
		display: flex;
		align-items: center;
	}
</style>
