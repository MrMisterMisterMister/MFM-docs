# Multiflexmeter V3.7.0 Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Comprehensive technical documentation for the **Multiflexmeter V3.7.0** - an open-source IoT sensor platform for environmental monitoring using LoRaWAN.

## 📚 What's Included

This documentation covers:

- **Getting Started** - Setup, building, and flashing firmware
- **Architecture** - System design with interactive C4 diagrams (LikeC4)
- **Configuration** - EEPROM, LoRaWAN credentials, and device settings
- **Communication Protocol** - Uplink/downlink messages and command formats
- **Hardware Reference** - Pin mappings, specifications, and fuse settings
- **API Reference** - Complete function documentation with examples

<!-- ## 🚀 Quick Start

### View Documentation Locally

```bash
npm install
npm run dev
```

Then open your browser to: **http://localhost:4321**

### Build for Production

```bash
npm run build
```

The static site will be generated in the `dist/` directory. -->

## 📁 Project Structure

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
├── netlify.toml             # Netlify deployment config
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Vitest testing configuration
└── README.md                # This file
```

## 🧞 Commands

All commands are run from the root of the project:

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
| `npm run likec4:start` | Start LikeC4 dev server |
| `npm run likec4:build` | Build LikeC4 diagrams to `dist/diagrams` |
| `npm run likec4:export` | Export LikeC4 diagrams as PNG to `public/diagrams` |
| `npm run generate:model` | Generate TypeScript model from LikeC4 (`likec4 codegen typescript`) |
| `npm run generate:docs` | Run LikeC4 docs integration codegen |
| `npm run test` | Run tests (`vitest`) |

Examples
```bash
# Start both dev servers (Astro + LikeC4)
npm run dev:both

# Build site + diagrams for production
npm run build
```

Tip: If you only need interactive diagrams while authoring docs, run `npm run dev:likec4`. For full local site preview including docs, run `npm run dev:astro` (or `npm run dev`).

## 🎨 Architecture Diagrams

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

<!-- ## 🚢 Deployment

### GitHub Pages

```bash
npm run build
# Deploy the dist/ folder to GitHub Pages
```

### Netlify

1. Run `npm run build`
2. Drag and drop the `dist/` folder to Netlify
3. Or connect your GitHub repo for auto-deployment

### Vercel

1. Connect your GitHub repository
2. Vercel auto-detects Astro and configures build settings
3. Deploy automatically on every commit -->

## ✏️ Adding Content

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

## 🛠️ Customization

### Update Branding

Edit `astro.config.mjs`:

```javascript
starlight({
  title: 'Your Project Name',
  social: [
    { icon: 'github', href: 'https://github.com/MrMisterMisterMister/MFM-docs' }
  ],
  // ... other settings
})
```

<!-- ### Add Logo

Replace `src/assets/houston.webp` with your logo and update `src/content/docs/index.mdx`. -->

<!-- ### Modify Theme

Starlight supports custom CSS. See [Starlight's customization guide](https://starlight.astro.build/guides/customization/). -->

## 📖 Documentation Guidelines

When contributing to the documentation:

1. **Update the LikeC4 model** - Edit `src/likec4/model.c4` for architecture changes
2. **Include code examples** - Provide practical, runnable examples
3. **Add troubleshooting sections** - Document common issues and solutions
4. **Cross-reference related topics** - Link to related documentation pages
5. **Use Starlight components** - Leverage callouts, cards, and other components

## 🤝 About the Project

Multiflexmeter V3.7.0 is an open-source IoT sensor platform designed for:
- Environmental monitoring
- Long-range wireless communication via LoRaWAN
- Low-power battery operation
- Flexible sensor integration

**Microcontroller:** ATmega1284P  
**Radio:** RFM95 LoRa (868MHz)  
**Protocol:** LoRaWAN 1.0.x with OTAA  
**Framework:** Arduino with LMIC library

## 📚 Resources

- **Starlight Documentation:** https://starlight.astro.build/
- **Astro Documentation:** https://docs.astro.build/
- **C4 Model:** https://c4model.com/
- **LikeC4:** https://likec4.dev/

## 📄 License

N/A