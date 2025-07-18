import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Algolia site verification */}
                <meta name="algolia-site-verification" content="9E3353543245A860" />

                {/* Algolia Netlify Integration */}
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.css" />

                {/* Custom Algolia Styles */}
                <style>{`
                  #header-search .aa-Form {
                    border: 1px solid #d1d5db !important;
                    border-radius: 8px !important;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
                    background: white !important;
                  }
                  
                  #header-search .aa-InputWrapper {
                    padding: 0 !important;
                  }
                  
                  #header-search .aa-Input {
                    border: none !important;
                    outline: none !important;
                    font-size: 16px !important;
                    width: 100% !important;
                    padding: 12px 16px !important;
                    color: #374151 !important;
                    background: transparent !important;
                  }
                  
                  #header-search .aa-Input::placeholder {
                    color: #9ca3af !important;
                  }
                  
                  #header-search .aa-Panel {
                    border-radius: 8px !important;
                    border: 1px solid #e5e7eb !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
                    background: white !important;
                    margin-top: 4px !important;
                    max-height: 400px !important;
                    overflow-y: auto !important;
                    z-index: 1000 !important;
                  }
                  
                  #header-search .aa-Item {
                    padding: 12px 16px !important;
                    border-bottom: 1px solid #f3f4f6 !important;
                    cursor: pointer !important;
                  }
                  
                  #header-search .aa-Item:hover,
                  #header-search .aa-Item[aria-selected="true"] {
                    background-color: #f9fafb !important;
                  }
                `}</style>

                {/* Other meta tags can go here */}
                <meta charSet="utf-8" />

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
                        placeholder: 'Search site...',
                        hitsPerPage: 5,
                        debug: true,
                        poweredBy: true
                      });
                      console.log('Algolia search initialized successfully');
                      
                      // Ensure input field is visible and focusable
                      setTimeout(function() {
                        const input = document.querySelector('#header-search input');
                        if (input) {
                          input.style.display = 'block';
                          input.style.width = '100%';
                          input.style.padding = '12px 16px';
                          input.style.border = '1px solid #d1d5db';
                          input.style.borderRadius = '8px';
                          input.style.fontSize = '16px';
                          input.style.outline = 'none';
                          console.log('Search input styled successfully');
                        } else {
                          console.warn('Search input not found');
                        }
                      }, 500);
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
