<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(async () => {
		// Service Worker Registration
		if (browser && 'serviceWorker' in navigator) {
			try {
				// Check if service worker is already registered
				const registration = await navigator.serviceWorker.getRegistration();
				
				if (registration) {
					console.log('✅ Service Worker already registered:', registration.scope);
					return;
				}
				
				// Register service worker only if not already registered
				const newRegistration = await navigator.serviceWorker.register('/sw.js');
				console.log('✅ Service Worker registered successfully:', newRegistration.scope);
				
				// Listen for updates
				newRegistration.addEventListener('updatefound', () => {
					console.log('🔄 Service Worker update found');
				});
				
			} catch (error) {
				console.error('❌ Service Worker registration failed:', error);
			}
		}
	});
</script>

{@render children()}
