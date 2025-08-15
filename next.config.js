/* eslint-env node */
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW,
        NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
        NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
        NEXT_PUBLIC_COMMIT_HASH: process.env.VERCEL_GIT_COMMIT_SHA || 'development'
    },
    trailingSlash: true,
    reactStrictMode: true,
    allowedDevOrigins: ['192.168.1.84'],

    // Performance optimizations
    compress: true,
    poweredByHeader: false,
    generateEtags: true,

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000, // 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
    },

    // Headers for better caching
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ]
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            },
            {
                source: '/(.*).wasm',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                    {
                        key: 'Content-Type',
                        value: 'application/wasm'
                    }
                ]
            }
        ];
    },

    // Bundle analyzer (optional, for development)
    ...(process.env.ANALYZE === 'true' && {
        webpack: (config, { isServer }) => {
            if (!isServer) {
                const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
                config.plugins.push(
                    new BundleAnalyzerPlugin({
                        enabled: true,
                        openAnalyzer: false
                    })
                );
            }
            return config;
        }
    }),

    webpack(config, { isServer, dev }) {
        // Add WebAssembly support
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true
        };

        // Mitigation: avoid filesystem cache rename errors during dev HMR
        // (ENOENT on .next/cache/webpack/*pack.gz_ -> *.gz). Disable
        // webpack persistent caching in development only.
        if (dev) {
            config.cache = false;
        }

        // Handle .wasm files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async'
        });

        // Ensure WASM files are properly handled in both server and client
        if (!isServer) {
            config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
        }

        // Performance optimizations
        if (!dev) {
            // Enable tree shaking
            config.optimization = {
                ...config.optimization,
                usedExports: true,
                sideEffects: false
            };

            // Split chunks for better caching
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    },
                    mathematical: {
                        test: /[\\/]src[\\/]lib[\\/]mathematical[\\/]/,
                        name: 'mathematical',
                        chunks: 'all',
                        priority: 10
                    },
                    caching: {
                        test: /[\\/]src[\\/]lib[\\/]caching[\\/]/,
                        name: 'caching',
                        chunks: 'all',
                        priority: 10
                    }
                }
            };
        }

        return config;
    }
};

module.exports = nextConfig;
