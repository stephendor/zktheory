---
title: Blog
slug: /blog
numOfPostsPerPage: 8
enableSearch: true
topSections:
  - title:
      text: Featured Post
      color: text-dark
      type: TitleBlock
    subtitle: This is the subtitle
    posts:
      - content/pages/blog/top-ten-lessons-we-learned.md
    showThumbnail: true
    showExcerpt: true
    showDate: true
    showAuthor: true
    variant: big-list
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pt-28
          - pb-0
          - pl-4
          - pr-4
        justifyContent: flex-start
    type: FeaturedPostsSection
    hoverEffect: move-up
styles:
  title:
    textAlign: center
seo:
  metaTitle: Blog - Demo site
  metaDescription: >-
    This is the blog of the demo site where we post about technology, product,
    and design.
  socialImage: /images/img-placeholder.svg
  type: Seo
type: PostFeedLayout
bottomSections:
  - type: RecentPostsSection
    title:
      type: TitleBlock
      text: Recent posts
      color: text-dark
      styles:
        self:
          textAlign: center
    recentCount: 3
    showThumbnail: true
    showExcerpt: true
    showDate: true
    showAuthor: true
    actions: []
    elementId: ''
    variant: three-col-grid
    colors: bg-light-fg-dark
    hoverEffect: thin-underline
    styles:
      self:
        justifyContent: center
---
