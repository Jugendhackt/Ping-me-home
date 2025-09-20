<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { children } = $props();

	// PWA Service Worker Registration
	onMount(async () => {
		if (browser && 'serviceWorker' in navigator) {
			try {
				// Import and register the PWA service worker automatically
				const { registerSW } = await import('virtual:pwa-register');
				const updateSW = registerSW({
					onNeedRefresh() {
						console.log('🔄 New content available, please refresh.');
						// You can show a toast/notification here
					},
					onOfflineReady() {
						console.log('📱 App ready to work offline');
					},
				});
				console.log('✅ PWA Service Worker registered successfully');
			} catch (error) {
				console.error('❌ PWA Service Worker registration failed:', error);
				// Fallback to manual registration
				try {
					const registration = await navigator.serviceWorker.register('/sw.js');
					console.log('✅ Fallback: Service Worker registered manually:', registration.scope);
				} catch (fallbackError) {
					console.error('❌ Manual Service Worker registration also failed:', fallbackError);
				}
			}
		}
	});
</script>

{@render children()}
