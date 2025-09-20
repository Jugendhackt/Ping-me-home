<script lang="ts">
	import type { PageData } from './$types';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	function goToProfile() {
		goto('/app/profile');
	}
</script>

<svelte:head>
	<title>Dashboard - JHCGN</title>
	<meta name="description" content="PMH Application" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="app-page">
	<div class="dashboard-header">
		<div class="welcome-content">
			<ProfileAvatar
				displayName={data.user.displayName || data.user.email?.split('@')[0] || 'User'}
				profileURL={data.user.profileURL || ''}
				size="large"
			/>
			<div class="welcome-text">
				<h1>
					Welcome back, {data.user.displayName || data.user.email?.split('@')[0] || 'User'}! 👋
				</h1>
				<p>What's poppin today?</p>
			</div>
		</div>
		<button class="edit-profile-btn" onclick={goToProfile}> ⚙️ Edit Profile </button>
	</div>

	<div class="dashboard-grid">
		<div class="dashboard-card profile-card">
			<div class="card-header">
				<h2>👤 Profile Information</h2>
				<button class="card-action" onclick={goToProfile}>Edit</button>
			</div>
			<div class="profile-info">
				<div class="profile-avatar-section">
					<ProfileAvatar
						displayName={data.user.displayName || data.user.email?.split('@')[0] || 'User'}
						profileURL={data.user.profileURL || ''}
						size="medium"
					/>
					<div class="profile-details">
						<h3>{data.user.displayName || 'No display name set'}</h3>
						<p>{data.user.email}</p>
					</div>
				</div>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">User ID</span>
						<span class="info-value">{data.user.uid}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Account Role</span>
						<span class="info-value role-badge">{data.user.role || 'user'}</span>
					</div>
					{#if data.user.createdAt}
						<div class="info-item">
							<span class="info-label">Member Since</span>
							<span class="info-value">{new Date(data.user.createdAt).toLocaleDateString()}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="dashboard-card">
			<div class="card-header">
				<h2>📊 Activity</h2>
			</div>
			<div class="activity-content">
				<div class="activity-item">
					<div class="activity-icon">🆕</div>
					<div class="activity-text">
						<span class="activity-title">Account Created</span>
						<span class="activity-time">
							{data.user.createdAt
								? new Date(data.user.createdAt).toLocaleDateString()
								: 'Recently'}
						</span>
					</div>
				</div>
				{#if data.user.updatedAt && data.user.updatedAt !== data.user.createdAt}
					<div class="activity-item">
						<div class="activity-icon">✏️</div>
						<div class="activity-text">
							<span class="activity-title">Profile Updated</span>
							<span class="activity-time">{new Date(data.user.updatedAt).toLocaleDateString()}</span
							>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.app-page {
		width: 100%;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
	}

	.welcome-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.welcome-text h1 {
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 600;
	}

	.welcome-text p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.edit-profile-btn {
		background: var(--accent-color);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.edit-profile-btn:hover {
		background: var(--accent-hover);
	}

	.dashboard-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
	}

	.dashboard-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1.5rem;
		transition: box-shadow 0.2s ease;
	}

	.dashboard-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.card-header h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.card-action {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;
	}

	.card-action:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.profile-card {
		grid-column: span 1;
	}

	.profile-info {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.profile-avatar-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.profile-details h3 {
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 600;
	}

	.profile-details p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-color);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.info-value {
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.role-badge {
		background: var(--accent-color);
		color: white;
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.activity-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 8px;
	}

	.activity-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.activity-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.activity-title {
		color: var(--text-primary);
		font-weight: 500;
		font-size: 0.85rem;
	}

	.activity-time {
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.welcome-content {
			flex-direction: column;
			text-align: center;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
		}

		.profile-avatar-section {
			flex-direction: column;
			text-align: center;
		}

		.info-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>
