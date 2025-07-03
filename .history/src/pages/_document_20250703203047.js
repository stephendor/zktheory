import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Algolia site verification */}
                <meta name="algolia-site-verification" content="9E3353543245A860" />

                {/* Algolia Netlify Integration */}
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.css" />

                {/* Other meta tags can go here */}
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                {/* Favicon */}
                <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
            </Head>
            <body>
                <Main />
                <NextScript />

                {/* Algolia Netlify Search Script */}
                <script
                    type="text/javascript"
                    src="https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.js"
                    onLoad={() => console.log('Algolia script loaded')}
                ></script>
                <script
                    type="text/javascript"
                    dangerouslySetInnerHTML={{
                        __html: `
              // Wait for hydration to complete before initializing Algolia
              window.addEventListener('DOMContentLoaded', function() {
                // Additional delay to ensure React hydration is complete
                setTimeout(function() {
                  console.log('Initializing Algolia search...');
                  try {
                    if (typeof algoliasearchNetlify !== 'undefined') {
                      algoliasearchNetlify({
                        appId: 'VH9QK9PMCW',
                        apiKey: '2dd8d5abf2372ef29252d8eff33155d9',
                        siteId: '14010c38-351d-436e-878a-6364014e43d9',
                        branch: 'main',
                        selector: 'div#header-search',
                      });
                      console.log('Algolia search initialized successfully');
                    } else {
                      console.warn('Algolia search library not loaded');
                    }
                  } catch (error) {
                    console.error('Algolia search initialization failed:', error);
                  }
                }, 1000);
              });
            `
                    }}
                />
            </body>
        </Html>
    );
}
