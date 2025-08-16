---
title: Home
slug: /
sections:
  - type: TriplePathHeroSection
    title:
      text: 'Mathematical Excellence Meets Practical Innovation'
      color: text-math-primary
      type: TitleBlock
    subtitle: 'Zero-Knowledge Proofs • Topological Data Analysis • Advanced Cryptography'
    text: >
      Transforming complex mathematical concepts into practical solutions for business, technical, and academic applications. Choose your pathway to mathematical mastery.
    badge:
      label: ZKTheory
      color: bg-math-primary text-white
      type: Badge
    elementId: 'triple-path-hero'
    colors: bg-gradient-mathematical
    styles:
      self:
        height: screen
        alignItems: center
        flexDirection: col
        justifyContent: center
        padding: []
    performanceMode: balanced
    enableParallax: true
    enableHoverPreview: true
    enablePathTransitions: true
    screenReaderOptimized: true
    businessConfig:
      roiCalculatorEnabled: true
      trustIndicators:
        - 'Enterprise Security Standards'
        - 'Compliance Ready Architecture'
        - 'Fortune 500 Deployment Experience'
    technicalConfig:
      playgroundEnabled: true
      githubRepoUrl: 'https://github.com/zktheory/zktheory-core'
    academicConfig:
      collaborationEnabled: true
      researchPortalUrl: '/research'
  - posts: []
    showThumbnail: true
    showDate: true
    showAuthor: true
    variant: three-col-grid
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pl-16
          - pb-16
          - pr-16
        justifyContent: center
    type: FeaturedPostsSection
    hoverEffect: move-up
  - title:
      text: Explore further
      color: text-primary
      styles:
        self:
          textAlign: center
      type: TitleBlock
    subtitle: 'Interactive tools and educational resources'
    items:
      - type: FeaturedItem
        title: Cayley Graphs
        tagline: Group Theory Visualization
        subtitle: Interactive Mathematical Exploration
        text: |
          Explore the structure of finite groups through interactive Cayley graph visualizations. Generate graphs for symmetric groups, dihedral groups, and more with dynamic highlighting of subgroups and cosets.
        image:
          type: ImageBlock
          url: /images/abstract-feature-cayley.svg
          altText: Interactive Cayley Graph Explorer
          styles:
            self:
              borderRadius: x-large
        actions:
          - type: Button
            label: Launch Explorer
            url: /projects/cayleygraph
            icon: arrowRight
            iconPosition: right
            style: secondary
        colors: bg-light-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            borderRadius: x-large
            flexDirection: col
      - type: FeaturedItem
        title: TDA Explorer
        tagline: Topological Data Analysis
        subtitle: Interactive Persistent Homology
        text: |
          Discover the topological structure hidden in your data. Visualize persistence diagrams, barcodes, and Mapper networks to understand connectivity patterns, holes, and clusters in point cloud data.
        image:
          type: ImageBlock
          url: /images/abstract-feature-tda.svg
          altText: TDA Explorer Interactive Tool
          styles:
            self:
              borderRadius: x-large
        actions:
          - type: Button
            label: Launch Explorer
            url: /projects/tda-explorer
            icon: play
            iconPosition: right
            style: secondary
        colors: bg-light-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            borderRadius: x-large
            flexDirection: col
      - type: FeaturedItem
        title: Mathematical Bridges
        tagline: Advanced Visualization
        subtitle: Elliptic Curves ↔ Algebra ↔ Topology
        text: |
          Explore profound connections between mathematical domains through interactive animated transformations. See how elliptic curves, abstract algebra, and topology interconnect through research-grade visualizations.
        image:
          type: ImageBlock
          url: /images/abstract-feature-bridges.svg
          altText: Mathematical Bridge Transformations
          styles:
            self:
              borderRadius: x-large
        actions:
          - type: Button
            label: Launch Explorer
            url: /projects/bridge-transformations
            icon: play
            iconPosition: right
            style: secondary
        colors: bg-light-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            borderRadius: x-large
            flexDirection: col
      - type: FeaturedItem
        title: Concept Mapping
        tagline: Knowledge Graph
        subtitle: Interactive Mathematical Connections
        text: |
          Navigate the interconnected landscape of mathematics through force-directed graph visualization. Discover relationships between concepts with interactive filtering and guided learning pathways.
        image:
          type: ImageBlock
          url: /images/concept-mapping-preview.svg
          altText: Mathematical Concept Mapping Interface
          styles:
            self:
              borderRadius: x-large
        actions:
          - type: Button
            label: Explore Graph
            url: /projects/concept-mapping
            icon: play
            iconPosition: right
            style: secondary
        colors: bg-light-fg-dark
        styles:
          self:
            padding:
              - pt-8
              - pl-8
              - pb-8
              - pr-8
            borderRadius: x-large
            flexDirection: col
    variant: three-col-grid
    colors: bg-neutral-fg-dark
    styles:
      self:
        padding:
          - pt-16
          - pl-8
          - pb-16
          - pr-8
        justifyContent: center
      subtitle:
        textAlign: center
    type: FeaturedItemsSection
seo:
  metaTitle: Home - ZKTheory
  metaDescription: Exploring cryptography
  type: Seo
type: PageLayout
---
