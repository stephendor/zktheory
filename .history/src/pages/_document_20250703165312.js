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
                ></script>
                <script
                    type="text/javascript"
                    dangerouslySetInnerHTML={{
                        __html: `
              algoliasearchNetlify({
                appId: '2TS56WA21I',
                apiKey: '2dd8d5abf2372ef29252d8eff33155d9',
                siteId: '9a198ac3-c2d8-485e-8784-51c1f3def1d5',
                branch: 'main',
                selector: 'div#search',
              });
            `
                    }}
                />
            </body>
        </Html>
    );
}
