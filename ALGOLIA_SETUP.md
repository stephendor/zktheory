# Algolia Search Setup (Netlify Integration)

This project uses the official Netlify-Algolia integration for search functionality, which automatically indexes your content when you deploy to Netlify.

## Setup Instructions

### 1. Netlify-Algolia Integration (Already Configured)

✅ The integration has been set up with these settings:

- **App ID**: `2TS56WA21I`
- **Site ID**: `9a198ac3-c2d8-485e-8784-51c1f3def1d5`
- **Branch**: `main`

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Replace the placeholder values with your actual Algolia credentials:

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id_here
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_api_key_here
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=zktheory_content

# For indexing script (server-side only)
ALGOLIA_ADMIN_API_KEY=your_admin_api_key_here
```

**Important**:

- Use the **Search API Key** for `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` (this is safe to expose in frontend)
- Use the **Admin API Key** for `ALGOLIA_ADMIN_API_KEY` (this should only be used server-side for indexing)

### 3. Install Dependencies

```bash
npm install dotenv
```

### 4. Index Your Content

Run the indexing script to upload your content to Algolia:

```bash
npm run index-content
```

This script will:

- Extract content from all markdown files in `content/pages/` and `content/data/`
- Clean and format the content for search
- Upload everything to your Algolia index
- Configure search settings

### 5. GitBook Integration

To integrate with GitBook:

1. Create a GitBook space for your HTB documentation
2. Update the iframe URL in `/content/pages/projects/htb-certification.md`
3. The current setup points to `https://docs.zktheory.org`

## Usage

### Search Component

The `AlgoliaSearch` component is available throughout the site. It's currently used on the HTB certification page with a dedicated search section.

### Adding Search to Other Pages

You can add the search functionality to any page by including a `SearchSection` in the page's frontmatter:

```yaml
sections:
  - type: SearchSection
    title: Search Documentation
    subtitle: Find what you're looking for quickly
    colors: bg-light-fg-dark
```

### Customizing Search Results

Modify `scripts/index-content.js` to:

- Change which content gets indexed
- Modify how content is processed
- Add custom fields for better search results

## Features

- **Real-time search** with autocomplete
- **Multiple content types**: Pages, blog posts, projects
- **Rich search results** with titles, descriptions, and URLs
- **Responsive design** that works on all devices
- **Customizable styling** to match your site theme

## Troubleshooting

### Search not working?

1. Check that environment variables are correctly set
2. Verify your Algolia API keys have the right permissions
3. Run `npm run index-content` to ensure content is indexed
4. Check the browser console for any JavaScript errors

### Content not appearing in search?

1. Make sure the content has proper frontmatter with `title` and `type` fields
2. Re-run the indexing script: `npm run index-content`
3. Check the Algolia dashboard to see if records were created

### GitBook embed not working?

1. Verify the GitBook URL is publicly accessible
2. Check that the GitBook space allows embedding
3. Update the iframe `src` attribute with the correct URL
