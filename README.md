# Multiflexmeter 3.7.0 Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Comprehensive technical documentation for the **Multiflexmeter 3.7.0** - an open-source IoT sensor platform for environmental monitoring using LoRaWAN.

## What's Included

This documentation covers:

- **Getting Started** - Setup, building, and flashing firmware
- **Architecture** - System design with interactive C4 diagrams (LikeC4)
- **Configuration** - EEPROM, LoRaWAN credentials, and device settings
- **Communication Protocol** - Uplink/downlink messages and command formats
- **Hardware Reference** - Pin mappings, specifications, and fuse settings
- **API Reference** - Complete function documentation with examples

<!-- ## Project Structure

```
MFM-docs/
├── .github/                  # GitHub configuration
├── .vscode/                  # VS Code settings
├── dist/                     # Built site output (generated)
├── node_modules/             # Dependencies (generated)
├── public/
│   └── favicon.svg           # Site favicon
├── src/
│   ├── assets/               # Images and media files
│   ├── likec4/               # LikeC4 architecture models
│   │   └── model.c4          # C4 architecture definition
│   ├── content/
│   │   ├── docs/             # Documentation content
│   │   │   ├── index.mdx     # Landing page
│   │   │   ├── overview/     # Project overview
│   │   │   ├── hardware/     # Hardware documentation
│   │   │   ├── firmware/     # Firmware documentation
│   │   │   ├── deployment/   # Deployment guides
│   │   │   ├── development/  # Development guides
│   │   │   ├── guides/       # Tutorial content
│   │   │   ├── reference/    # Reference documentation
│   │   │   └── troubleshooting/ # Troubleshooting guides
│   │   └── config.ts         # Content configuration
│   └── content.config.ts     # Content type definitions
├── test/                     # Test files
├── .gitignore               # Git ignore rules
├── .gitmessage              # Git commit template
├── astro.config.mjs         # Astro configuration
├── likec4.config.ts         # LikeC4 configuration
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Vitest testing configuration
└── README.md                # This file
``` -->

## Quick Start - Real-time Dashboard

Want to see the Multiflexmeter in action with a real-time dashboard?

```bash
# Install dependencies
npm install

# Start both the Astro server and device simulator
npm run dev:dashboard

# Open the dashboard
# Navigate to: http://localhost:4321/dashboard
```

This will:
1. Start the Astro development server
2. Launch the device simulator (sends data every 10 seconds)
3. Display live sensor data on an interactive Chart.js dashboard

See [simulator/README.md](simulator/README.md) for more details on simulation and TTN integration.

## Commands

All commands are run from the root of the project:

### Documentation Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install project dependencies |
| `npm run dev` / `npm start` | Start Astro dev server (default port) |
| `npm run dev:astro` | Start Astro dev on `localhost:4321` |
| `npm run dev:likec4` | Start LikeC4 dev server on `localhost:5173` |
| `npm run dev:both` | Run Astro + LikeC4 concurrently (uses `concurrently`) |
| `npm run build` | Build production site (alias for `build:all`) |
| `npm run build:astro` | Run `astro build` — generates `./dist/` |
| `npm run build:diagrams` | Build LikeC4 diagrams to `dist/diagrams` with base `/diagrams/` |
| `npm run build:all` | Run `build:astro` then `build:diagrams` |
| `npm run preview` | Preview the built site locally (`astro preview`) |
| `npm run astro` | Invoke the Astro CLI |

### Simulator & Dashboard Commands

| Command | Description |
| :--- | :--- |
| `npm run simulator` | Start device simulator (local mode) |
| `npm run simulator:ttn` | Start device simulator (TTN mode) |
| `npm run dev:dashboard` | Start Astro server + simulator together |

### LikeC4 Diagram Commands

| Command | Description |
| :--- | :--- |
| `npm run likec4:start` | Start LikeC4 dev server |
| `npm run likec4:build` | Build LikeC4 diagrams to `dist/diagrams` |
| `npm run likec4:export` | Export LikeC4 diagrams as PNG to `public/diagrams` |
| `npm run generate:model` | Generate TypeScript model from LikeC4 (`likec4 codegen typescript`) |
| `npm run generate:docs` | Run LikeC4 docs integration codegen |

### Testing

| Command | Description |
| :--- | :--- |
| `npm run test` | Run tests (`vitest`) |

### Examples

```bash
# Start documentation site with interactive diagrams
npm run dev:both

# Start real-time dashboard with simulator
npm run dev:dashboard

# Build site + diagrams for production
npm run build

# Run just the device simulator
npm run simulator
```

Tip: If you only need interactive diagrams while authoring docs, run `npm run dev:likec4`. For full local site preview including docs, run `npm run dev:astro` (or `npm run dev`).

## Architecture Diagrams

The documentation includes interactive C4 architecture diagrams built with LikeC4.

### Viewing Diagrams

**Live Site:**
- Visit the deployed documentation site
- Navigate to "Interactive Diagrams" or visit `/diagrams/`
- Explore interactive system architecture views

**Development:**
- Install "LikeC4" VS Code extension
- Open `src/likec4/model.c4` to view the source
- Run `npm run dev:likec4` for local diagram server
- Or edit online at: https://likec4.dev/

## Adding Content

### New Documentation Page

1. Create a new `.md` file in `src/content/docs/`
2. Add frontmatter:
   ```markdown
   ---
   title: Your Page Title
   description: Page description
   ---
   
   Your content here...
   ```
3. Update `astro.config.mjs` sidebar if needed
4. The page will automatically appear in the site

### New Architecture Diagram

1. Edit the LikeC4 model in `src/likec4/model.c4`
2. The diagrams will be automatically built and served at `/diagrams/`
3. Reference in documentation with links to the interactive diagrams:

## Documentation Guidelines

When contributing to the documentation:

1. **Update the LikeC4 model** - Edit `src/likec4/model.c4` for architecture changes
2. **Include code examples** - Provide practical, runnable examples
3. **Add troubleshooting sections** - Document common issues and solutions
4. **Cross-reference related topics** - Link to related documentation pages
5. **Use Starlight components** - Leverage callouts, cards, and other components

## About the Project

Multiflexmeter 3.7.0 is an open-source IoT sensor platform designed for:
- Environmental monitoring
- Long-range wireless communication via LoRaWAN
- Low-power battery operation
- Flexible sensor integration

**Microcontroller:** ATmega1284P  
**Radio:** RFM95 LoRa (868MHz)  
**Protocol:** LoRaWAN 1.0.x with OTAA  
**Framework:** Arduino with LMIC library

## Resources

- **Starlight Documentation:** https://starlight.astro.build/
- **Multiflexmeter-3.7.0 Release:** https://github.com/Multiflexmeter/Multiflexmeter/releases/tag/V3.7.0
- **Astro Documentation:** https://docs.astro.build/
- **C4 Model:** https://c4model.com/
- **LikeC4:** https://likec4.dev/

## License

N/A