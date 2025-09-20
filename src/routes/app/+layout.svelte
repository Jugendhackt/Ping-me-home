<script lang="ts">
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
	import { goto } from '$app/navigation';
	import NavTitle from '$lib/components/NavTitle.svelte';
	
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
			<NavTitle />
			
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
							<button class="menu-item" onclick={goToProfile} style="gap: 5px;">
								{@render settingsIcon()} Profile Settings
							</button>
							<button class="menu-item logout-item" onclick={handleLogout} style="gap: 5px;">
								{@render logoutIcon("var(--error-color)")} Logout
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
		color: var(--error-color);
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

{#snippet settingsIcon()}
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>
{/snippet}

{#snippet logoutIcon(color: string)}
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={color}><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
{/snippet}
