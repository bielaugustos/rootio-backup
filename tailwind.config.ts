import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			display: [
  				'Geist',
  				'sans-serif'
  			],
  			sans: [
  				'Space Grotesk',
  				'Geist',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'Geist Mono',
  				'Menlo',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			ink: '#111111',
  			paper: '#FDFBF5',
  			amber: {
  				'2': '#FBBF24',
  				DEFAULT: '#F59E0B',
  				deep: '#B45309',
  				soft: '#FEF3C7'
  			},
  			sun: '#FFD23F',
  			grass: '#7CE577',
  			sky: '#6FB8FF',
  			violet: '#9B7BFF',
  			coral: '#FF6B6B',
  			peach: '#FFB39B',
  			mute: '#7A7268',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			DEFAULT: '0px',
  			none: '0px',
  			sm: '0px',
  			md: '0px',
  			lg: '0px',
  			xl: '0px',
  			'2xl': '0px',
  			full: '0px'
  		},
  		borderWidth: {
  			DEFAULT: '3px',
  			hairline: '3px',
  			bold: '4px'
  		},
  		boxShadow: {
  			nb: '4px 4px 0 0 #111111',
  			'nb-lg': '6px 6px 0 0 #111111',
  			'nb-xl': '8px 8px 0 0 #111111',
  			'nb-sm': '2px 2px 0 0 #111111',
  			'nb-amber': '4px 4px 0 0 #B45309',
  			none: 'none'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'slide-in-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				from: {
  					opacity: '0',
  					transform: 'scale(.96)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			blink: {
  				'0%,100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '.3'
  				}
  			},
  			'stamp-in': {
  				from: {
  					opacity: '0',
  					transform: 'scale(.7) rotate(-8deg)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1) rotate(-3deg)'
  				}
  			},
  			'nb-press': {
  				'0%,100%': {
  					transform: 'translate(0,0)',
  					boxShadow: '4px 4px 0 #111'
  				},
  				'50%': {
  					transform: 'translate(2px,2px)',
  					boxShadow: '2px 2px 0 #111'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-in-up': 'slide-in-up 0.2s ease',
  			'scale-in': 'scale-in 0.15s ease',
  			'fade-in': 'fade-in 0.2s ease',
  			blink: 'blink 1.5s infinite',
  			'stamp-in': 'stamp-in 0.3s ease',
  			'nb-press': 'nb-press 0.15s ease'
  		}
  	}
  },
  plugins: [animate],
}

export default config
