<script lang="ts">
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
	import { goto } from '$app/navigation';
	
	let { data, children }: { data: LayoutData, children: any } = $props();
	let theme = $state('light');
	let showUserMenu = $state(false);
	
	onMount(() => {
		// Load theme from localStorage or default to light
		const savedTheme = localStorage.getItem('theme') || 'light';
		theme = savedTheme;
		document.documentElement.setAttribute('data-theme', theme);
		
		// Close user menu when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (!target.closest('.user-menu-container')) {
				showUserMenu = false;
			}
		};
		
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
	
	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	}
	
	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}
	
	function goToProfile() {
		showUserMenu = false;
		goto('/app/profile');
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
			<a href="/app" class="app-title" style="text-decoration: none; cursor: pointer;">Ping me Home!</a>
			
			<div class="header-actions">
				<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
					{theme === 'light' ? '🌙' : '☀️'}
				</button>
				
				<div class="user-menu-container">
					<button class="profile-btn" onclick={toggleUserMenu} aria-label="User menu">
						<ProfileAvatar 
							displayName={data.user.displayName || data.user.email?.split('@')[0] || 'User'} 
							profileURL={data.user.profileURL || ''}
							size="small"
						/>
						<span class="user-name">{data.user.displayName || data.user.email?.split('@')[0] || 'User'}</span>
					</button>
					
					{#if showUserMenu}
						<div class="user-dropdown">
							<div class="user-info">
								<div class="user-details">
									<ProfileAvatar 
										displayName={data.user.displayName || data.user.email?.split('@')[0] || 'User'} 
										profileURL={data.user.profileURL || ''}
										size="medium"
									/>
									<div class="user-text">
										<span class="user-display-name">{data.user.displayName || 'User'}</span>
										<span class="user-email">{data.user.email}</span>
									</div>
								</div>
							</div>
							<hr class="menu-divider" />
							<button class="menu-item" onclick={goToProfile}>
								⚙️ Profile Settings
							</button>
							<button class="menu-item logout-item" onclick={handleLogout}>
								🚪 Logout
							</button>
						</div>
					{/if}
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

	.main-nav {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		padding: 8px 12px;
		border-radius: 6px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.nav-link:global(.active) {
		color: var(--accent-color);
		background: var(--accent-bg);
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
	
	.user-menu-container {
		position: relative;
	}
	
	.profile-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 6px 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.profile-btn:hover {
		background: var(--bg-hover);
	}
	
	.user-name {
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		white-space: nowrap;
	}
	
	.user-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		min-width: 240px;
		overflow: hidden;
		z-index: 1000;
	}
	
	.user-info {
		padding: 16px;
	}
	
	.user-details {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.user-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	
	.user-display-name {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.9rem;
	}
	
	.user-email {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}
	
	.menu-divider {
		border: none;
		border-top: 1px solid var(--border-color);
		margin: 0;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		background: none;
		border: none;
		padding: 12px 16px;
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--text-primary);
		transition: background-color 0.2s ease;
		text-align: left;
	}
	
	.menu-item:hover {
		background: var(--bg-hover);
	}
	
	.logout-item {
		color: var(--accent-color);
	}
	
	.logout-item:hover {
		background: rgba(231, 76, 60, 0.1);
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

		.main-nav {
			gap: 10px;
		}

		.nav-link {
			padding: 6px 8px;
			font-size: 0.9rem;
		}
		
		.user-name {
			display: none;
		}
		
		.main-content {
			padding: 16px;
		}
		
		.header-actions {
			gap: 12px;
		}
		
		.user-dropdown {
			right: -8px;
			min-width: 200px;
		}
	}
	
	@media (max-width: 480px) {
		.theme-toggle {
			padding: 6px 10px;
			font-size: 1rem;
		}
	}
</style>
