// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL,
	integrations: [
		starlight({
			title: 'Multiflexmeter V3.7.0',
			description: 'Documentation for the Multiflexmeter V3.7.0 open-source IoT sensor platform',
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
					label: 'Hardware',
					items: [
						{ label: 'Hardware Overview', slug: 'hardware/overview' },
						{ label: 'Specifications', slug: 'hardware/specifications' },
						{ label: 'Pin Mappings', slug: 'hardware/pinout' },
						{ label: 'Schematics', slug: 'hardware/schematics' },
					],
				},
				{
					label: 'Firmware',
					items: [
						{ label: 'Firmware Architecture', slug: 'firmware/architecture' },
						{ label: 'Specifications', slug: 'firmware/specifications' },
						{ label: 'Communication Protocol', slug: 'firmware/protocol' },
						{ label: 'API Reference', slug: 'firmware/api-reference' },
						{ label: 'Build System', slug: 'firmware/build-system' },
					],
				},
				{
					label: 'Software & Backend',
					items: [
						{ label: 'Overview', slug: 'software' },
					],
				},
				{
					label: 'Deployment',
					items: [
						{ label: 'Quick Start Guide', slug: 'deployment/quick-start' },
						{ label: 'Configuration', slug: 'deployment/configuration' },
						{ label: 'TTN Setup', slug: 'deployment/ttn-setup' },
						{ label: 'Field Deployment', slug: 'deployment/field-deployment' },
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Development Guide', slug: 'development/development-guide' },
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
