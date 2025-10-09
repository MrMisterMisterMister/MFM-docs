// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'MultiFlexMeter V3 Docs',
			description: 'Documentation for the MultiFlexMeter V3 open-source IoT sensor platform',
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/your-org/multiflexmeter' 
				}
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'Architecture Overview', slug: 'guides/architecture' },
						{ label: 'Configuration', slug: 'guides/configuration' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Communication Protocol', slug: 'reference/protocol' },
						{ label: 'Hardware Reference', slug: 'reference/hardware' },
						{ label: 'API Reference', slug: 'reference/api' },
					],
				},
			],
		}),
	],
});
