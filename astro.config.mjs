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
						{ label: 'Introduction', slug: 'overview/introduction' },
						{ label: 'Features & Capabilities', slug: 'overview/features' },
						{ label: 'System Architecture', slug: 'overview/architecture' },
					],
				},
				{
					label: 'Getting Started',
					items: [
						{ label: 'Quick Start Guide', slug: 'deployment/quick-start' },
						{ label: 'Configuration', slug: 'deployment/configuration' },
					],
				},
				{
					label: 'Hardware',
					items: [
						{ label: 'Hardware Overview', slug: 'hardware/overview' },
						{ label: 'Specifications', slug: 'hardware/specifications' },
						{ label: 'Pin Mappings', slug: 'hardware/pinout' },
						{ label: 'Schematics', slug: 'hardware/schematics' },
						{ label: 'Programming', slug: 'hardware/programming' },
					],
				},
				{
					label: 'Firmware',
					items: [
						{ label: 'Firmware Architecture', slug: 'firmware/architecture' },
						{ label: 'Specifications', slug: 'firmware/specifications' },
						{ label: 'Communication Protocol', slug: 'firmware/protocol' },
						{ label: 'Data Formats', slug: 'firmware/data-formats' },
						{ label: 'API Reference', slug: 'firmware/api-reference' },
						{ label: 'Build System', slug: 'firmware/build-system' },
					],
				},
				{
					label: 'Sensor Modules',
					items: [
						{ label: 'Module Overview', slug: 'sensor-modules' },
						{ label: 'KY-003 Hall Sensor', slug: 'sensor-modules/ky-003-hall' },
						{ label: 'IR Break Beam', slug: 'sensor-modules/ir-break-beam' },
						{ label: 'Mock Sensor', slug: 'sensor-modules/mock-sensor' },
					],
				},
				{
					label: 'Software & Backend',
					items: [
						{ label: 'Overview', slug: 'software' },
						{ label: 'Real-time Dashboard', slug: 'software/dashboard' },
					],
				},
				{
					label: 'System Diagrams',
					items: [
						{ label: 'Diagram Overview', slug: 'system-diagrams' },
						{ label: 'Measurement Cycle', slug: 'system-diagrams/measurement-cycle' },
						{ label: 'Communication Sequence', slug: 'system-diagrams/communication-sequence' },
						{ label: 'Data Flow', slug: 'system-diagrams/data-flow' },
						{ label: 'Error Handling', slug: 'system-diagrams/error-handling' },
					],
				},
				{
					label: 'Deployment',
					items: [
						{ label: 'TTN Setup', slug: 'deployment/ttn-setup' },
						{ label: 'TTN Webhooks Testing', slug: 'deployment/ttn-webhooks-testing' },
						{ label: 'Field Deployment', slug: 'deployment/field-deployment' },
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Development Guide', slug: 'development/development-guide' },
						{ label: 'Device Simulator', slug: 'development/simulator' },
					],
				},
				{
					label: 'Troubleshooting',
					items: [
						{ label: 'Common Issues', slug: 'troubleshooting/common-issues' },
						{ label: 'Debugging', slug: 'troubleshooting/debugging' },
						{ label: 'FAQ', slug: 'troubleshooting/faq' },
					],
				},
			],
		}),
	],
});
