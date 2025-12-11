/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				slate: {
					850: '#1a202e',
					950: '#0f172a',
				}
			},
			fontFamily: {
				inter: ['Inter', 'system-ui', 'sans-serif'],
			},
			animation: {
				'spin-slow': 'spin 8s linear infinite',
				'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
				'ping': 'ping 2s ease-in-out infinite',
				'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
				'slide-in': 'slideIn 0.3s ease',
			},
			keyframes: {
				'pulse-dot': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				ping: {
					'0%': { transform: 'scale(1)', opacity: '0.8' },
					'100%': { transform: 'scale(1.5)', opacity: '0' },
				},
				'pulse-scale': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
				},
				slideIn: {
					from: {
						opacity: '0',
						transform: 'translateX(-10px)',
					},
					to: {
						opacity: '1',
						transform: 'translateX(0)',
					},
				},
			},
		},
	},
	plugins: [],
}
