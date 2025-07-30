---
title: Home
slug: /
sections:
  - type: GenericSection
    title:
      text: ''
      color: text-dark
      type: TitleBlock
    subtitle: 'From zero to finite fields'
    text: >
      A journey into cybersecurity and cryptography
    actions:
      - label: Get started
        altText: ''
        url: /blog
        showIcon: false
        icon: arrowRight
        iconPosition: right
        style: secondary
        elementId: ''
        type: Button
    media:
      url: /images/amirhadi-manavi-0hUcJZZnYM4-unsplash.jpg
      altText: ''
      elementId: ''
      type: ImageBlock
    badge:
      label: ZK Theory
      color: text-primary
      type: Badge
      styles:
        self:
          textAlign: left
    elementId: ''
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
          url: /images/cayley-graph-icon.svg
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
    variant: one-col-grid
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
