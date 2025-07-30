---
type: PageLayout
title: Interactive Cayley Graph Explorer
sections:
  - type: GenericSection
    title:
      type: TitleBlock
      text: Interactive Cayley Graph Explorer
      color: text-primary
      styles:
        self:
          textAlign: center
    subtitle: 'Visualize group theory through interactive Cayley graphs'
    text: |
      Explore the mathematical structure of finite groups through interactive Cayley graph visualizations. This tool allows you to generate Cayley graphs for various groups including symmetric groups, dihedral groups, and alternating groups, with dynamic highlighting of subgroups, cosets, and group centers.

      ### Features:
      - **Group Selection**: Choose from Symmetric Groups (Sₙ), Dihedral Groups (Dₙ), and Alternating Groups (Aₙ)
      - **Custom Generators**: Define your own generators for symmetric and alternating groups
      - **Interactive Visualization**: Spring-layout graphs with vertex labeling
      - **Subgroup Highlighting**: Visualize cyclic subgroups and their elements
      - **Coset Analysis**: Display left and right cosets with color coding
      - **Center Highlighting**: Identify and highlight the center of the group

      ### Mathematical Background:
      A Cayley graph is a way to visualize the structure of a finite group. For a group G and a set of generators S, the Cayley graph has:
      - Vertices representing group elements
      - Edges connecting elements g and gs for each generator s ∈ S

      This visualization helps understand group properties like:
      - Connectivity and structure
      - Subgroup relationships
      - Coset decompositions
      - Group centers and normal subgroups
    actions:
      - type: Button
        label: Launch Interactive Tool
        url: '#cayley-graph-tool'
        style: primary
        showIcon: true
        icon: arrowRight
        iconPosition: right
      - type: Button
        label: View Full Jupyter Notebook
        url: '/projects/cayley-notebook'
        style: secondary
        showIcon: true
        icon: book
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
    elementId: cayley-graph-tool
    title:
      type: TitleBlock
      text: Interactive Tool
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      <div id="cayley-graph-explorer-container"></div>

      ### How to Use:
      1. **Select Group Type**: Choose from the dropdown (Symmetric, Dihedral, or Alternating)
      2. **Set Parameter**: Enter the group parameter n (e.g., 3 for S₃ or D₃)
      3. **Define Generators**: For symmetric/alternating groups, specify generators as tuples
      4. **Generate Graph**: Click to create the Cayley graph visualization
      5. **Explore Features**: Use highlighting options to study subgroups and cosets

      ### Example Generators:
      - **S₃**: `(1,2), (1,2,3)` - transposition and 3-cycle
      - **S₄**: `(1,2), (1,2,3,4)` - transposition and 4-cycle  
      - **A₄**: `(1,2,3), (1,2,4)` - two 3-cycles

    colors: bg-neutral-fg-dark
    styles:
      self:
        alignItems: center
        flexDirection: col
        padding:
          - pt-8
          - pl-16
          - pb-16
          - pr-16

  - type: GenericSection
    title:
      type: TitleBlock
      text: Educational Resources
      color: text-primary
      styles:
        self:
          textAlign: center
    text: |
      ### Learn More About Group Theory:

      **Recommended Reading:**
      - *Visual Group Theory* by Nathan Carter
      - *Algebra: Notes from the Underground* by Paolo Aluffi
      - - *Contemporary Abstract Algebra* by Joseph Gallian

      **Online Resources:**
      - [Group Explorer 3.0](https://nathancarter.github.io/group-explorer/GroupExplorer.html) (The inspiration for this project)
      - [SageMath Group Theory Documentation](https://doc.sagemath.org/html/en/reference/groups/index.html)
      - [Interactive Group Theory with GAP](https://www.gap-system.org/)

      ### Under the Hood:
      This modern implementation is built using:
      - **TypeScript**: For type-safe mathematical computations and robust development
      - **React Three Fiber**: For high-performance 3D visualization and interaction
      - **Next.js 15**: For modern web application framework with excellent performance
      - **Advanced Layout Algorithms**: Implementing Group Explorer's proven strategies with modern optimizations

      The source code demonstrates:
      - Modern web-based mathematical visualization
      - Real-time 3D group theory computation
      - Responsive and accessible educational interface design
      - Professional-grade software architecture
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

slug: /projects/cayleygraph
isDraft: false
seo:
  type: Seo
  metaTitle: Interactive Cayley Graph Explorer - Group Theory Visualization
  metaDescription: Explore finite group structures through interactive Cayley graph visualizations. Educational tool for understanding symmetric groups, dihedral groups, and more.
  addTitleSuffix: true
  socialImage: /images/cayley-graph-preview.svg
  metaTags:
    - property: 'og:type'
      content: 'article'
    - name: 'keywords'
      content: 'group theory, cayley graphs, mathematics, visualization, symmetric groups, dihedral groups'
---
