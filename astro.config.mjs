// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL || 'http://localhost:4321',
	output: 'server', // Enable SSR for API endpoints and SSE
	adapter: vercel({
		webAnalytics: { enabled: true },
	}),
	vite: {
		ssr: {
			// Exclude better-sqlite3 from SSR bundle (it's only used in dev)
			external: ['better-sqlite3'],
		},
		build: {
			rollupOptions: {
				// Prevent bundling better-sqlite3 in production
				external: ['better-sqlite3'],
			},
		},
	},
	integrations: [
		tailwind({
			applyBaseStyles: false, // Don't interfere with Starlight's styles
		}),
		mermaid(),
		starlight({
			title: 'Multiflexmeter',
			description: 'Documentation for the Multiflexmeter 3.7.0 open-source IoT sensor platform',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/MrMisterMisterMister/MFM-docs'
				}
			],
			sidebar: [
				{
					label: 'Overview',
					items: [
						{ label: 'Architecture', slug: 'overview/architecture' },
					],
				},
				{
					label: 'Getting Started',
					items: [
						{ label: 'Quick Start', slug: 'deployment/quick-start' },
					],
				},
				{
					label: 'Hardware',
					items: [
						{ label: 'Specifications', slug: 'hardware/specifications' },
					],
				},
				{
					label: 'Firmware',
					items: [
						{ label: 'LoRaWAN Protocol', slug: 'firmware/protocol' },
						{ label: 'Data Formats', slug: 'firmware/data-formats' },
						{ label: 'EEPROM Configuration', slug: 'firmware/configuration' },
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Development Guide', slug: 'development/development-guide' },
					],
				},
			],
		}),
	],
});
