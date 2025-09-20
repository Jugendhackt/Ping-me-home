<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	let isPWAMode = $state(false);
	let showInstallPrompt = $state(false);
	let installPromptEvent: any = null;
	
	onMount(() => {
		// Detect if running as PWA
		isPWAMode = window.matchMedia('(display-mode: standalone)').matches ||
					 window.matchMedia('(display-mode: fullscreen)').matches ||
					 (window.navigator as any).standalone === true;
		
		// Listen for PWA install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			installPromptEvent = e;
			showInstallPrompt = true;
		});
		
		// Auto-redirect to login if this is a PWA launch and user might be logged in
		if (data.isPWALaunch || isPWAMode) {
			// Small delay to let any authentication check complete
			setTimeout(() => {
				// Check if there's a session cookie
				if (document.cookie.includes('session=')) {
					goto('/app');
				}
			}, 100);
		}
	});
	
	function navigateToLogin() {
		goto('/login');
	}
	
	function navigateToRegister() {
		goto('/register');
	}
	
	async function handleInstallPWA() {
		if (installPromptEvent) {
			installPromptEvent.prompt();
			const { outcome } = await installPromptEvent.userChoice;
			console.log(`PWA install prompt outcome: ${outcome}`);
			showInstallPrompt = false;
			installPromptEvent = null;
		}
	}
</script>

<svelte:head>
	<title>Ping me Home!</title>
	<meta
		name="description"
		content="Your mobile-first PWA experience"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="landing-container">
	<div class="hero-section">
		<div class="logo-area">
			<h1 class="app-title">PMH</h1>
			<p class="app-subtitle">
				{isPWAMode ? 'Welcome back!' : 'Welcome to the PMH PWA'}
			</p>
			{#if isPWAMode}
				<p class="pwa-indicator">Running as PWA ✨</p>
			{/if}
		</div>
		
		<div class="action-buttons">
			<button 
				class="btn btn-primary"
				onclick={navigateToLogin}
			>
				Sign In
			</button>
			
			<button 
				class="btn btn-secondary"
				onclick={navigateToRegister}
			>
				Create Account
			</button>
			
			{#if showInstallPrompt && !isPWAMode}
				<button 
					class="btn btn-install"
					onclick={handleInstallPWA}
				>
					📱 Install App
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.landing-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}
	
	.hero-section {
		text-align: center;
		max-width: 400px;
		width: 100%;
	}
	
	.logo-area {
		margin-bottom: 40px;
	}
	
	.app-title {
		font-size: 3rem;
		font-weight: 700;
		color: white;
		margin: 0 0 8px 0;
		letter-spacing: -1px;
	}
	
	.app-subtitle {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		font-weight: 300;
	}
	
	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.btn {
		padding: 16px 24px;
		border-radius: 12px;
		border: none;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
	}
	
	.btn-primary {
		background: white;
		color: #667eea;
	}
	
	.btn-primary:hover {
		background: #f8f9fa;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	
	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}
	
	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-2px);
	}
	
	.btn-install {
		background: linear-gradient(135deg, #10b981 0%, #047857 100%);
		color: white;
		border: none;
	}
	
	.btn-install:hover {
		background: linear-gradient(135deg, #059669 0%, #065f46 100%);
		transform: translateY(-2px);
	}
	
	.pwa-indicator {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.9);
		margin-top: 8px;
		font-weight: 500;
	}
	
	@media (max-width: 480px) {
		.app-title {
			font-size: 2.5rem;
		}
		
		.btn {
			padding: 14px 20px;
		}
	}
</style>