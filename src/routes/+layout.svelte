<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { children } = $props();

	// PWA Service Worker Registration
	onMount(async () => {
		if (browser && 'serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/sw.js');
				console.log('✅ Service Worker registered successfully:', registration.scope);
			} catch (error) {
				console.error('❌ Service Worker registration failed:', error);
			}
		}
	});
</script>

{@render children()}
