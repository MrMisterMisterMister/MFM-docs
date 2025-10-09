# Starlight Starter Kit: Basics

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

# MultiFlexMeter V3 Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Comprehensive technical documentation for the **MultiFlexMeter V3** - an open-source IoT sensor platform for environmental monitoring using LoRaWAN.

## 📚 What's Included

This documentation covers:

- **Getting Started** - Setup, building, and flashing firmware
- **Architecture** - System design with C4 diagrams (PlantUML & LikeC4)
- **Configuration** - EEPROM, LoRaWAN credentials, and device settings
- **Communication Protocol** - Uplink/downlink messages and command formats
- **Hardware Reference** - Pin mappings, specifications, and fuse settings
- **API Reference** - Complete function documentation with examples

## 🚀 Quick Start

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

The static site will be generated in the `dist/` directory.

## 📁 Project Structure

```
MFM-docs/
├── public/
│   ├── favicon.svg
│   └── diagrams/              # C4 architecture diagrams
│       ├── *.puml            # PlantUML format
│       ├── *.likec4          # LikeC4 format
│       └── README.md         # Diagram rendering guide
├── src/
│   ├── assets/               # Images and media
│   ├── content/
│   │   └── docs/             # Documentation content
│   │       ├── index.mdx     # Landing page
│   │       ├── guides/       # Tutorial and guide content
│   │       │   ├── getting-started.md
│   │       │   ├── architecture.md
│   │       │   └── configuration.md
│   │       └── reference/    # Reference documentation
│   │           ├── protocol.md
│   │           ├── hardware.md
│   │           └── api.md
│   └── content.config.ts
├── astro.config.mjs          # Astro configuration
├── package.json
├── DOCUMENTATION_SUMMARY.md  # Maintainer reference
└── README.md                 # This file
```

## 🧞 Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🎨 Architecture Diagrams

The documentation includes C4 architecture diagrams in two formats:

- **PlantUML** (`.puml` files) - Traditional format, widely supported
- **LikeC4** (`.likec4` files) - Modern DSL with better tooling

See `public/diagrams/README.md` for rendering instructions.

### Viewing Diagrams

**PlantUML:**
- Install "PlantUML" VS Code extension
- Open any `.puml` file and press `Alt+D`
- Or use: https://www.plantuml.com/plantuml/

**LikeC4:**
- Install "LikeC4" VS Code extension
- Open any `.likec4` file
- Or use: https://likec4.dev/

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

1. Create both `.puml` and `.likec4` versions in `public/diagrams/`
2. Reference in documentation with:
   ```markdown
   **Diagrams:**
   - [PlantUML Version](/diagrams/your_diagram.puml)
   - [LikeC4 Version](/diagrams/your_diagram.likec4)
   ```

## 🛠️ Customization

### Update Branding

Edit `astro.config.mjs`:

```javascript
starlight({
  title: 'Your Project Name',
  social: [
    { icon: 'github', href: 'https://github.com/your-org/your-repo' }
  ],
  // ... other settings
})
```

### Add Logo

Replace `src/assets/houston.webp` with your logo and update `src/content/docs/index.mdx`.

### Modify Theme

Starlight supports custom CSS. See [Starlight's customization guide](https://starlight.astro.build/guides/customization/).

## 📖 Documentation Guidelines

When contributing to the documentation:

1. **Keep both diagram formats in sync** - Update both PlantUML and LikeC4 versions
2. **Include code examples** - Provide practical, runnable examples
3. **Add troubleshooting sections** - Document common issues and solutions
4. **Cross-reference related topics** - Link to related documentation pages
5. **Use Starlight components** - Leverage callouts, cards, and other components

## 🤝 About the Project

MultiFlexMeter V3 is an open-source IoT sensor platform designed for:
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
- **PlantUML:** https://plantuml.com/
- **LikeC4:** https://likec4.dev/

## 📄 License

[Specify your license here - e.g., MIT, Apache 2.0, etc.]

---

**Built with ❤️ using [Astro](https://astro.build) and [Starlight](https://starlight.astro.build)**


> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
