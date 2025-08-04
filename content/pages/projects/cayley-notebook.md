---
type: PageLayout
title: Cayley Graph Jupyter Notebook
sections:
  - type: GenericSection
    title:
      type: TitleBlock
      text: Interactive Cayley Graph Jupyter Notebook
      color: text-primary
      styles:
        self:
          textAlign: center
    subtitle: 'Explore our enhanced web-based interactive tool instead!'
    text: |
      **🚀 Recommended: [Web-Based Interactive Explorer](/projects/cayleygraph)**

      We now offer a **comprehensive web-based Cayley graph explorer** that works directly in your browser without any setup required! This interactive tool provides:

      ### ✅ What Works Now (No Setup Needed):
      - **Complete Group Database**: All finite groups up to order 20
      - **Interactive Visualization**: Real-time graph manipulation  
      - **Educational Features**: Built-in explanations of cosets and subgroups
      - **Advanced Layouts**: Optimized positioning for different group types
      - **Zero Dependencies**: No SageMath or local installation required

      ### 💡 Why Use the Web Version:
      - **Instant Access**: Works immediately in any modern browser
      - **Educational Focus**: Designed specifically for learning group theory
      - **Mobile Friendly**: Responsive design for all devices
      - **Always Updated**: Latest features and improvements

      [**➡️ Try the Interactive Explorer Now**](/projects/cayleygraph)

    actions:
      - type: Button
        label: View Static Notebook
        url: '#notebook-viewer'
        style: primary
        showIcon: true
        icon: arrowRight
        iconPosition: right
      - type: Button
        label: Download Notebook
        url: '/InteractiveCayley.ipynb'
        style: secondary
        showIcon: true
        icon: download
        iconPosition: right
    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: col
        padding:
          - pt-16
          - pl-16
          - pb-8
          - pr-16

  - type: GenericSection
    elementId: notebook-viewer
    title:
      type: TitleBlock
      text: Static Notebook View
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      <div id="notebook-embed-container"></div>

      ### Interactive vs Static View

      **This Static View:**
      - ✅ View all code and documentation
      - ✅ Understand the implementation approach
      - ✅ Copy code snippets for your own use
      - ❌ Cannot execute code or modify parameters
      - ❌ No interactive widgets or real-time computation

      **Full Jupyter Environment:**
      - ✅ Complete interactivity with IPython widgets
      - ✅ Real-time parameter modification
      - ✅ Execute and modify code cells
      - ✅ Generate graphs for any supported group
      - ✅ Full SageMath computational environment

    colors: bg-neutral-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: col
        padding:
          - pt-8
          - pl-16
          - pb-8
          - pr-16

  - type: GenericSection
    title:
      type: TitleBlock
      text: Setup Instructions
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      ### Quick Setup with Our Script

      We've created an automated setup script that handles all the configuration:

      ```bash
      # Download and run the setup script
      curl -O https://zktheory.netlify.app/setup_cayley_explorer.sh
      chmod +x setup_cayley_explorer.sh
      ./setup_cayley_explorer.sh
      ```

      ### Manual Setup

      If you prefer manual setup or need to troubleshoot:

      1. **Install SageMath**:
         ```bash
         # Using conda (recommended)
         conda install -c conda-forge sage
         
         # Or download from sagemath.org
         ```

      2. **Install Jupyter in SageMath**:
         ```bash
         sage -pip install jupyter ipywidgets
         sage -sh -c "jupyter nbextension enable --py widgetsnbextension --sys-prefix"
         ```

      3. **Launch the Notebook**:
         ```bash
         sage -n jupyter InteractiveCayley.ipynb
         ```

      ### System Requirements

      - **SageMath 9.0+**: Core mathematical computation engine
      - **Python 3.8+**: Required by SageMath
      - **Jupyter**: Notebook interface
      - **IPython Widgets**: Interactive controls
      - **Web Browser**: For accessing the notebook interface

      ### Supported Platforms

      - ✅ **Linux**: Full support (recommended)
      - ✅ **macOS**: Full support via Homebrew or conda
      - ✅ **Windows**: Via WSL2 or Docker (some limitations)
      - ✅ **Cloud**: CoCalc, Google Colab (with SageMath kernel)

    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: col
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16

  - type: GenericSection
    title:
      type: TitleBlock
      text: Educational Applications
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      ### Course Integration

      This notebook is designed for use in:

      **Undergraduate Courses:**
      - Abstract Algebra (Math 301/401 level)
      - Group Theory and Applications
      - Mathematical Computing with SageMath
      - Discrete Mathematics

      **Graduate Courses:**
      - Advanced Group Theory
      - Computational Algebra
      - Mathematical Visualization
      - Research Methods in Mathematics

      ### Learning Objectives

      Students will be able to:
      - Visualize abstract group structures through Cayley graphs
      - Understand the relationship between generators and group structure
      - Explore subgroup relationships and coset decompositions
      - Investigate conjugacy classes and normal subgroups
      - Apply computational tools to abstract mathematical concepts

      ### Assignment Ideas

      1. **Group Comparison**: Generate Cayley graphs for D₄ and Q₄, compare structures
      2. **Generator Analysis**: Explore how different generator sets affect graph appearance
      3. **Subgroup Investigation**: Find all subgroups of S₄ and visualize their relationships
      4. **Research Project**: Investigate a specific family of groups using the tool

      ### Assessment Opportunities

      - **Lab Reports**: Students document their explorations and discoveries
      - **Presentations**: Students present interesting group structures they've found
      - **Research Projects**: Extended investigations using the computational tools
      - **Problem Sets**: Structured exercises using the interactive environment

    colors: bg-neutral-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: col
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16

slug: /projects/cayley-notebook
isDraft: false
seo:
  type: Seo
  metaTitle: Cayley Graph Jupyter Notebook - Complete Interactive Implementation
  metaDescription: Full SageMath Jupyter notebook for exploring Cayley graphs of finite groups. Complete with interactive widgets, educational tools, and comprehensive group theory capabilities.
  addTitleSuffix: true
  socialImage: /images/cayley-graph-preview.svg
  metaTags:
    - property: 'og:type'
      content: 'article'
    - name: 'keywords'
      content: 'jupyter notebook, sagemath, group theory, cayley graphs, mathematics, interactive, education, computational algebra'
---
