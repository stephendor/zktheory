# ZKTheory - Cybersecurity & Cryptography Hub

![ZKTheory](https://assets.stackbit.com/docs/content-ops-starter-thumb.png)

A comprehensive platform for exploring cybersecurity, cryptography, and mathematical foundations. Built with Next.js and enhanced with interactive educational tools.

**🌐 Live Site:** [https://zktheory.netlify.app/](https://zktheory.netlify.app/)

## 🎯 Features

### Educational Tools

- **Interactive Cayley Graph Explorer**: Visualize group theory concepts with dynamic Cayley graphs
- **Cryptography Resources**: Tutorials and documentation on cryptographic concepts
- **Mathematical Foundations**: From zero knowledge to finite fields

### Content Areas

- **Blog**: Latest insights in cybersecurity and cryptography
- **Projects**: Interactive tools and educational resources
- **HTB Certification Journey**: Hack The Box learning path documentation
- **Research**: Security analysis and vulnerability research

### Technical Features

- Visual content editing with Netlify CMS
- Algolia-powered search functionality
- Responsive design with Tailwind CSS
- Mathematical rendering with KaTeX
- Interactive visualizations with React components

## 🔬 Interactive Cayley Graph Explorer

A specialized educational tool for visualizing finite group structures through Cayley graphs.

### Features (TDA Explorer)

- Support for Symmetric Groups (Sₙ), Dihedral Groups (Dₙ), and Alternating Groups (Aₙ)
- Interactive subgroup and coset highlighting
- Real-time graph generation and manipulation
- Educational explanations and examples

### Usage (TDA Explorer)

- **Web Interface**: Visit `/projects/cayleygraph` for the React-based interactive tool
- **Full Version**: Use the Jupyter notebook `InteractiveCayley.ipynb` with SageMath for complete functionality

### Setup for Full Version

```bash
# Run the setup script
./setup_cayley_explorer.sh

# Or manually start Jupyter with SageMath
sage -n jupyter InteractiveCayley.ipynb
```

See `CAYLEY_GRAPH_README.md` for detailed documentation.

## 🧬 Topological Data Analysis Explorer

A comprehensive interactive tool for exploring topological data analysis concepts with real-time visualization and analysis capabilities.

### Features

- **Advanced Point Cloud Generation**: 8 sophisticated patterns (circles, clusters, torus, Gaussian, spiral, grid, annulus)
- **Parameter Presets**: Optimized configurations for clustering, topology, density, sparse, and dense data analysis
- **Performance Monitoring**: Real-time frame rate, memory usage, and computation time tracking
- **Enhanced Export**: High-DPI screenshots, JSON/CSV exports, persistence results with metadata
- **Smart Data Handling**: CSV/JSON import/export with validation and progressive loading for large datasets
- **Interactive Visualizations**: Persistence diagrams, barcodes, and Mapper networks with D3.js

### Usage

- **Web Interface**: Visit `/projects/tda-explorer` for the full interactive tool
- **Real-time Analysis**: Generate point clouds, compute persistence, and explore topological features
- **Performance Optimization**: Configurable settings for different device capabilities and dataset sizes

### Technical Implementation

- Built with React + TypeScript and D3.js for visualization
- WASM-powered computation with JavaScript fallback
- Performance-optimized with lazy loading and monitoring
- Responsive design with collapsible UI sections

**⚡ View demo:** [https://content-ops-starter.netlify.app/](https://content-ops-starter.netlify.app/)

## Table of Contents

- [Deploying to Netlify](#deploying-to-netlify)
- [Develop with Netlify Visual Editor Locally](#develop-with-netlify-visual-editor-locally)
- [Building for production](#building-for-production)
- [Setting Up Algolia Search](#setting-up-algolia-search)
- [Developer Performance Diagnostics](#developer-performance-diagnostics)
- [Next Steps](#next-steps)
- [Support](#support)

## Deploying to Netlify

If you click "Deploy to Netlify" button, it will create a new repo for you that looks exactly like this one, and sets that repo up immediately for deployment on Netlify.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/content-ops-starter)

## Develop with Netlify Visual Editor Locally

The typical development process is to begin by working locally. Clone this repository, then run `npm install` in its root directory.

Run the Next.js development server:

```txt
cd content-ops-starter
npm run dev
```

Install the [Netlify Visual Editor CLI](https://www.npmjs.com/package/@stackbit/cli). Then open a new terminal window in the same project directory and run the Netlify visual editor dev server:

```txt
npm install -g @stackbit/cli
stackbit dev
```

This outputs your own Netlify visual editor URL. Open this, register, or sign in, and you will be directed to Netlify's visual editor for your new project.

![Next.js Dev + Visual Editor Dev](https://assets.stackbit.com/docs/next-dev-stackbit-dev.png)

## Building for production

To build a static site for production, run the following command

```shell
npm run build
```

## Setting Up Algolia Search

This starter includes Algolia search integration. To set it up:

1. Create an [Algolia](https://www.algolia.com/) account
2. Create a new application and index
3. Set the following environment variables:
   - `NEXT_PUBLIC_ALGOLIA_APP_ID` - Your Algolia application ID
   - `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` - Your Algolia search-only API key
   - `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Your index name

## Developer Performance Diagnostics

Use the built-in test pages to visualize client-side performance in development:

- Route: `/test/new-test` – simple control route to confirm routing works
- Route: `/test/perf-live` – live performance page (forces dynamic rendering)
- Optional HUD: `/test/perf-live?hud=1` – sticky FPS and heap HUD in the top-right

What you’ll see on `/test/perf-live`:

- Performance Panel (client-only): FPS, TTFB, DOMContentLoaded, Load, LCP, FID, CLS, JS Heap
- Pause/Resume button to stop sampling

Notes:

- Memory (JS heap) appears in Chromium-based browsers only
- Some Web Vitals may be approximate in dev; interact with the page to see FID/CLS
- These pages set `dynamic = 'force-dynamic'` and `revalidate = 0` to avoid stale caches

## Next Steps

Here are a few suggestions on what to do next if you're new to Netlify visual editor:

- Learn [Netlify visual editor overview](https://docs.netlify.com/visual-editor/visual-editing/)
- Check [Netlify visual editor reference documentation](https://visual-editor-reference.netlify.com/)

## Support

If you get stuck along the way, get help in our [support forums](https://answers.netlify.com/).
