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
					Welcome back, {data.user.displayName || data.user.email?.split('@')[0] || 'User'}!
				</h1>
				<p>Manage your profile and rooms</p>
			</div>
		</div>
		<button class="edit-profile-btn" onclick={goToProfile}> Edit Profile </button>
	</div>

	<div class="dashboard-grid">
		<div class="dashboard-card profile-card">
			<div class="card-header">
				<h2>Profile Information</h2>
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
				<h2>Rooms</h2>
				<button class="card-action" onclick={() => goto('/app/rooms')}>View All</button>
			</div>
			<div class="rooms-content">
				<div class="rooms-summary">
					<div class="rooms-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
						</svg>
					</div>
					<div class="rooms-text">
						<span class="rooms-title">Manage Your Rooms</span>
						<span class="rooms-description">Create, join, and manage your chat rooms</span>
					</div>
				</div>
				<div class="rooms-actions">
					<button class="primary-btn" onclick={() => goto('/app/rooms')}>
						View Rooms
					</button>
				</div>
			</div>
		</div>

		<div class="dashboard-card">
			<div class="card-header">
				<h2>Recent Activity</h2>
			</div>
			<div class="activity-content">
				<div class="activity-item">
					<div class="activity-icon">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6v4l3 3"/>
						</svg>
					</div>
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
						<div class="activity-icon">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34"/>
								<polygon points="18,2 22,6 12,16 8,16 8,12 18,2"/>
							</svg>
						</div>
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
		margin-bottom: 2.5rem;
		padding: 2rem 2.5rem;
		background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
		border: none;
		border-radius: 20px;
		box-shadow: var(--shadow-lg);
		position: relative;
		overflow: hidden;
	}

	.dashboard-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
		pointer-events: none;
	}

	.welcome-content {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
	}

	.welcome-text h1 {
		margin: 0 0 0.5rem 0;
		color: white;
		font-size: 1.75rem;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.welcome-text p {
		margin: 0;
		color: rgba(255, 255, 255, 0.9);
		font-size: 1rem;
		font-weight: 400;
	}

	.edit-profile-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		position: relative;
		z-index: 1;
	}

	.edit-profile-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.dashboard-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		margin-bottom: 2rem;
	}

	.dashboard-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 20px;
		padding: 2rem;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.dashboard-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.dashboard-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		border-color: var(--accent-color);
	}

	.dashboard-card:hover::before {
		opacity: 1;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 1;
	}

	.card-header h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card-action {
		background: var(--accent-light);
		color: var(--accent-color);
		border: 1px solid var(--accent-color);
		padding: 0.5rem 1rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.3s ease;
		position: relative;
		z-index: 1;
	}

	.card-action:hover {
		background: var(--accent-color);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.profile-card {
		grid-column: span 1;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
	}

	.profile-info {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
	}

	.profile-avatar-section {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-tertiary);
		border-radius: 16px;
		border: 1px solid var(--border-color);
		backdrop-filter: blur(10px);
	}

	.profile-details h3 {
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 700;
	}

	.profile-details p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		backdrop-filter: blur(5px);
		transition: all 0.3s ease;
	}

	.info-item:hover {
		background: var(--bg-hover);
		transform: translateX(4px);
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.info-value {
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.role-badge {
		background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}

	.activity-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		z-index: 1;
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--bg-tertiary);
		border-radius: 16px;
		border: 1px solid var(--border-color);
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
	}

	.activity-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		background: var(--bg-hover);
	}

	.activity-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
		border-radius: 12px;
		color: white;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.activity-icon svg {
		width: 20px;
		height: 20px;
	}

	.activity-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.activity-title {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.95rem;
	}

	.activity-time {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 500;
	}

	.rooms-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
	}

	.rooms-summary {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--bg-tertiary);
		border-radius: 16px;
		border: 1px solid var(--border-color);
		backdrop-filter: blur(10px);
	}

	.rooms-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
		border-radius: 12px;
		color: white;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.rooms-icon svg {
		width: 24px;
		height: 24px;
	}

	.rooms-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.rooms-title {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.95rem;
	}

	.rooms-description {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 500;
	}

	.rooms-actions {
		display: flex;
		gap: 0.75rem;
	}

	.primary-btn {
		background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.3s ease;
		flex: 1;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.primary-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
		
		.dashboard-card {
			padding: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.dashboard-header {
			flex-direction: column;
			gap: 1.5rem;
			text-align: center;
			padding: 2rem 1.5rem;
			margin-bottom: 2rem;
		}

		.welcome-content {
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}

		.welcome-text h1 {
			font-size: 1.5rem;
		}

		.welcome-text p {
			font-size: 0.9rem;
		}

		.edit-profile-btn {
			padding: 0.75rem 1.25rem;
			font-size: 0.85rem;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.dashboard-card {
			padding: 1.25rem;
		}

		.card-header h2 {
			font-size: 1.1rem;
		}

		.profile-avatar-section {
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}

		.info-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
			padding: 1rem;
		}

		.info-item:hover {
			transform: none;
		}

		.activity-item {
			padding: 1rem;
		}

		.rooms-summary {
			padding: 1rem;
		}

		.primary-btn {
			padding: 0.75rem 1.25rem;
			font-size: 0.85rem;
		}
	}

	@media (max-width: 480px) {
		.dashboard-header {
			padding: 1.5rem 1rem;
		}

		.dashboard-grid {
			gap: 1rem;
		}

		.dashboard-card {
			padding: 1rem;
			border-radius: 16px;
		}

		.card-header h2 {
			font-size: 1rem;
		}

		.activity-icon,
		.rooms-icon {
			width: 40px;
			height: 40px;
		}

		.activity-icon svg,
		.rooms-icon svg {
			width: 18px;
			height: 18px;
		}

		.activity-item,
		.rooms-summary {
			padding: 0.75rem;
		}
	}
</style>
