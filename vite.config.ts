import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	server: {
		host: true,
	},
	plugins: [
		tailwindcss(), 
		sveltekit(),
		VitePWA({
			strategies: 'generateSW',
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			includeAssets: ['favicon.svg', 'robots.txt', 'manifest.json'],
			manifest: false, // Use existing manifest.json
			workbox: {
				globPatterns: ['**/*.{js,css,ico,png,svg,webp}'],
				cleanupOutdatedCaches: true,
				skipWaiting: true,
				clientsClaim: true,
				navigateFallback: null, // Disable navigation fallback for SvelteKit
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
							}
						}
					},
					{
						urlPattern: /^https:\/\/[^\/]+\/api\/.*$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 5 // 5 minutes
							},
							networkTimeoutSeconds: 10
						}
					},
					{
						// Cache SvelteKit navigation requests
						urlPattern: ({ request, url }) => {
							// Cache navigation requests (documents)
							return request.mode === 'navigate';
						},
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 30 // 30 minutes
							},
							networkTimeoutSeconds: 3
						}
					}
				]
			},
			devOptions: {
				enabled: false // Disable PWA in development mode for SvelteKit
			}
		})
	]
});
