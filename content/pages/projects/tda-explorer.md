---
type: PageLayout
title: Topological Data Analysis Explorer
sections:
  - type: GenericSection
    title:
      text: Topological Data Analysis Explorer
      color: text-dark
      type: TitleBlock
    subtitle: Interactive exploration of persistent homology and topological features in data
    text: >
      Discover the hidden topological structure in your data with our interactive TDA explorer. 
      Visualize persistence diagrams, barcodes, and Mapper networks to understand the shape and connectivity patterns in point cloud data.


      **Quick Start:** Generate sample data, adjust filtration parameters, and explore how topological features persist across different scales.


      **Key Features:** Interactive point clouds • Real-time persistence analysis • WASM-powered computation • Mapper networks • Parameter presets • Performance monitoring • Advanced export capabilities
    actions:
      - type: Button
        label: Launch TDA Explorer
        altText: Open the interactive TDA visualization tool
        url: '#tda-app'
        showIcon: true
        icon: play
        iconPosition: right
        style: primary
    badge:
      type: Badge
      label: Interactive Tool
      color: text-primary
    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: row
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16
  - type: TDAExplorer
    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: column
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16
  - type: GenericSection
    title:
      text: Enhanced Features & Capabilities
      color: text-dark
      type: TitleBlock
    text: >
      **Advanced Point Cloud Generation:** Our TDA Explorer now supports 8 sophisticated point cloud patterns including circles, clusters, torus, Gaussian distributions, spirals, grids, and annulus structures. Each pattern can be customized with noise levels and density parameters.


      **Parameter Presets:** Quick-start with optimized configurations for common TDA scenarios:
      • **Clustering:** Optimized for cluster detection (50 points, moderate noise)
      • **Topology:** Balanced for topological feature discovery (75 points, low noise)
      • **Density:** High-density analysis (100 points, optimized radius)
      • **Sparse:** Sparse data exploration (30 points, high noise tolerance)
      • **Dense:** High-resolution analysis (150 points, minimal noise)


      **Performance Monitoring:** Real-time performance tracking including frame rate monitoring, memory usage, and computation time. Automatic performance warnings and optimization hints for large datasets.


      **Enhanced Export Capabilities:** Export your analysis in multiple formats:
      • High-DPI screenshots with metadata
      • JSON/CSV point cloud exports with parameters
      • Persistence results with statistical summaries
      • Comprehensive data analysis reports


      **Smart Data Handling:** Advanced file import/export with CSV/JSON support, parameter validation, and progressive loading for large datasets (lazy loading for >100 points).
    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: column
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16
  - type: GenericSection
    title:
      text: About TDA & Implementation
      color: text-dark
      type: TitleBlock
    text: >
      **Topological Data Analysis** studies the shape of data by examining its topological properties. 
      It's particularly useful for finding clusters, detecting holes and voids, and understanding global structure in complex datasets.


      **Core Concepts:** Simplicial complexes • Persistent homology • Filtrations • Persistence diagrams • Mapper algorithm


      **Built With:** React + TypeScript • D3.js visualization • Rust/WASM computation • JavaScript fallback • Performance optimization • Progressive data loading


      **Applications:** Data science • Biology • Neuroscience • Materials science • Computer vision • Finance


      **Recent Enhancements:** The TDA Explorer has been significantly enhanced with parameter presets, performance monitoring, advanced export capabilities, and improved user experience. All features are designed to work reliably across browsers without complex WASM integration issues.
    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: column
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16
slug: /projects/tda-explorer
isDraft: false
seo:
  type: Seo
  metaTitle: TDA Explorer - Interactive Topological Data Analysis
  metaDescription: >-
    Explore topological data analysis with our interactive tool. Visualize
    persistence diagrams, barcodes, and Mapper networks to understand data
    topology. Features include parameter presets, performance monitoring, and advanced export capabilities.
  addTitleSuffix: true
  socialImage: /images/tda-preview.svg
  metaTags:
    - type: MetaTag
      property: 'og:type'
      content: website
    - type: MetaTag
      property: 'og:image:alt'
      content: TDA Explorer Interactive Tool
    - type: MetaTag
      name: 'twitter:card'
      content: summary_large_image
---
