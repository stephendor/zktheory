// Algolia configuration
// Replace these with your actual Algolia credentials
export const algoliaConfig = {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'YOUR_APP_ID',
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || 'YOUR_SEARCH_API_KEY',
  indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'your_index_name'
};

export default algoliaConfig;
