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

### Features

- Support for Symmetric Groups (Sₙ), Dihedral Groups (Dₙ), and Alternating Groups (Aₙ)
- Interactive subgroup and coset highlighting
- Real-time graph generation and manipulation
- Educational explanations and examples

### Usage

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

**⚡ View demo:** [https://content-ops-starter.netlify.app/](https://content-ops-starter.netlify.app/)

## Table of Contents

- [Deploying to Netlify](#deploying-to-netlify)
- [Develop with Netlify Visual Editor Locally](#develop-with-netlify-visual-editor-locally)
- [Building for production](#building-for-production)
- [Setting Up Algolia Search](#setting-up-algolia-search)
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

## Next Steps

Here are a few suggestions on what to do next if you're new to Netlify visual editor:

- Learn [Netlify visual editor overview](https://docs.netlify.com/visual-editor/visual-editing/)
- Check [Netlify visual editor reference documentation](https://visual-editor-reference.netlify.com/)

## Support

If you get stuck along the way, get help in our [support forums](https://answers.netlify.com/).
