---
type: PageLayout
title: Enhanced Cayley Graph Explorer
sections:
  - type: GenericSection
    title:
      type: TitleBlock
      text: Enhanced Cayley Graph Explorer
      color: text-primary
      styles:
        self:
          textAlign: center
    subtitle: 'Interactive group theory visualization for all finite groups up to order 20'
    text: |
      Explore group theory visually with our comprehensive Cayley graph explorer. 
      No SageMath required - complete implementation with enhanced visualization capabilities.

      **Quick Start:** Select a group, choose generators, click elements to highlight connections, shift+click to explore multiplication.

      **Groups Available:** All finite groups up to order 20 • Cyclic • Dihedral • Symmetric • Alternating • Klein • Quaternion

      **Features:** Dynamic visualization • Subgroup exploration • Multiplication tables • Color-coded conjugacy classes • Responsive design

      <EnhancedCayleyGraphExplorer />
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
    title:
      type: TitleBlock
      text: Group Theory Concepts
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      **Cayley Graphs** visualize finite group structure where vertices represent elements and directed edges show generator actions.

      **Core Concepts:** Order • Generators • Relations • Conjugacy classes • Center • Subgroups • Cosets • Normal subgroups

      **Group Families:** Cyclic (Cₙ) • Dihedral (Dₙ) • Symmetric (Sₙ) • Alternating (A₄) • Klein Four (V₄) • Quaternion (Q₈)

      **Subgroups & Cosets:** Subgroups partition groups into cosets of equal size. Normal subgroups have matching left/right cosets and enable quotient group formation.

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
      text: Usage & Applications
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      **Basic Controls:** Select group → Choose generators → Click elements to highlight → Shift+click for multiplication

      **Visualization:** Show/hide labels • Toggle arrows • Color by conjugacy class • Adjust sizes • Real-time properties panel

      **Educational Value:** Visual intuition for abstract concepts • Interactive operation exploration • Pattern recognition • Concrete examples

      **Subgroup Exploration:** Try D₃, D₄, or S₃ → Select "Explore Subgroups & Cosets" → Choose subgroup → Observe partitioning

    colors: bg-light-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: col
        padding:
          - pt-8
          - pl-16
          - pb-16
          - pr-16

slug: /projects/cayleygraph
isDraft: false
seo:
  type: Seo
  metaTitle: Enhanced Cayley Graph Explorer - Interactive Group Theory
  metaDescription: Explore finite groups up to order 20 with our comprehensive interactive Cayley graph explorer. Features complete group database, multiplication visualization, and advanced highlighting.
  addTitleSuffix: true
  socialImage: /images/cayley-graph-preview.svg
  metaTags:
    - property: 'og:type'
      content: 'article'
    - name: 'keywords'
      content: 'group theory, cayley graphs, mathematics, visualization, finite groups, interactive'
---
