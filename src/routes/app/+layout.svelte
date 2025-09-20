<script lang="ts">
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	
	let { data, children }: { data: LayoutData, children: any } = $props();
	let theme = $state('light');
	
	onMount(() => {
		// Load theme from localStorage or default to light
		const savedTheme = localStorage.getItem('theme') || 'light';
		theme = savedTheme;
		document.documentElement.setAttribute('data-theme', theme);
	});
	
	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	}
	
	async function handleLogout() {
		try {
			// Clear the session cookie by calling logout endpoint
			await fetch('/api/auth/logout', {
				method: 'POST'
			});
			
			// Redirect to login page
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
			// Force redirect even if logout fails
			window.location.href = '/login';
		}
	}
</script>

<div class="app-container">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<h1 class="app-title">JHCGN</h1>
			
			<div class="header-actions">
				<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
					{theme === 'light' ? '🌙' : '☀️'}
				</button>
				
				<div class="user-menu">
					<div class="user-info">
						<span class="user-email">{data.user.email}</span>
						<span class="user-role">{data.user.role}</span>
					</div>
					<button class="logout-btn" onclick={handleLogout}>
						Logout
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-container {
		min-height: 100vh;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		transition: background-color 0.3s ease, color 0.3s ease;
	}
	
	.header {
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 16px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.app-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-primary);
	}
	
	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	
	.theme-toggle {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.2s ease;
	}
	
	.theme-toggle:hover {
		background: var(--bg-hover);
	}
	
	.user-menu {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 0.85rem;
	}
	
	.user-email {
		color: var(--text-primary);
		font-weight: 500;
	}
	
	.user-role {
		color: var(--text-secondary);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.logout-btn {
		background: var(--accent-color);
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}
	
	.logout-btn:hover {
		background: var(--accent-hover);
	}
	
	.main-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px 20px;
		min-height: calc(100vh - 80px);
	}
	
	@media (max-width: 768px) {
		.header-content {
			padding: 12px 16px;
		}
		
		.app-title {
			font-size: 1.3rem;
		}
		
		.user-info {
			display: none;
		}
		
		.main-content {
			padding: 16px;
		}
		
		.header-actions {
			gap: 12px;
		}
	}
	
	@media (max-width: 480px) {
		.theme-toggle {
			padding: 6px 10px;
			font-size: 1rem;
		}
		
		.logout-btn {
			padding: 6px 12px;
			font-size: 0.8rem;
		}
	}
</style>
