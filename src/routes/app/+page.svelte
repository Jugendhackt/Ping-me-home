<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Ping me Home!</title>
	<meta name="description" content="PMH Application">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="app-page">
	<div class="welcome-section">
		<div class="welcome-card">
			<div class="welcome-header">
				<h1 class="welcome-title">Hello World! 👋</h1>
				<p class="welcome-subtitle">Welcome to Ping me Home!</p>
			</div>
			
			<div class="user-card">
				<h2 class="section-title">User Information</h2>
				<div class="user-details">
					<div class="detail-item">
						<span class="label">Email:</span>
						<span class="value">{data.user.email}</span>
					</div>
					<div class="detail-item">
						<span class="label">Role:</span>
						<span class="value role-badge">{data.user.role}</span>
					</div>
					<div class="detail-item">
						<span class="label">Email Verified:</span>
						<span class="value status-badge" class:verified={data.user.emailVerified} class:unverified={!data.user.emailVerified}>
							{data.user.emailVerified ? 'Verified' : 'Not Verified'}
						</span>
					</div>
					<div class="detail-item">
						<span class="label">User ID:</span>
						<span class="value user-id">{data.user.uid}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.app-page {
		width: 100%;
	}
	
	.welcome-section {
		display: flex;
		justify-content: center;
		width: 100%;
	}
	
	.welcome-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 32px;
		max-width: 800px;
		width: 100%;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}
	
	.welcome-header {
		text-align: center;
		margin-bottom: 32px;
	}
	
	.welcome-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 8px 0;
		color: var(--text-primary);
	}
	
	.welcome-subtitle {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin: 0;
	}
	
	.user-card {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 24px;
		margin-bottom: 32px;
	}
	
	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: var(--text-primary);
	}
	
	.user-details {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	
	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid var(--border-color);
	}
	
	.detail-item:last-child {
		border-bottom: none;
	}
	
	.label {
		font-weight: 500;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}
	
	.value {
		font-weight: 600;
		color: var(--text-primary);
		text-align: right;
	}
	
	.role-badge {
		background: var(--accent-color);
		color: white;
		padding: 4px 12px;
		border-radius: 16px;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.status-badge {
		padding: 4px 12px;
		border-radius: 16px;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.verified {
		background: #10b981;
		color: white;
	}
	
	.unverified {
		background: #f59e0b;
		color: white;
	}
	
	.user-id {
		font-family: monospace;
		font-size: 0.8rem;
		background: var(--bg-primary);
		padding: 4px 8px;
		border-radius: 4px;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.features-section {
		margin-top: 32px;
	}
	
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-top: 16px;
	}
	
	.feature-card {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 20px;
		text-align: center;
		transition: transform 0.2s ease;
	}
	
	.feature-card:hover {
		transform: translateY(-2px);
	}
	
	.feature-icon {
		font-size: 2rem;
		margin-bottom: 12px;
	}
	
	.feature-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: var(--text-primary);
	}
	
	.feature-description {
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.4;
	}
	
	@media (max-width: 768px) {
		.welcome-card {
			padding: 24px;
		}
		
		.welcome-title {
			font-size: 2rem;
		}
		
		.user-card {
			padding: 20px;
		}
		
		.detail-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}
		
		.value {
			text-align: left;
		}
		
		.user-id {
			max-width: 100%;
		}
		
		.feature-grid {
			grid-template-columns: 1fr;
		}
	}
	
	@media (max-width: 480px) {
		.welcome-card {
			padding: 20px;
		}
		
		.welcome-title {
			font-size: 1.75rem;
		}
		
		.feature-card {
			padding: 16px;
		}
	}
</style>
