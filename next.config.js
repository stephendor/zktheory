/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true,
    allowedDevOrigins: [
        '192.168.1.84'
    ],
    webpack(config, { isServer }) {
        // Add WebAssembly support
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
        };

        // Handle .wasm files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // Ensure WASM files are properly handled in both server and client
        if (!isServer) {
            config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
        }

        return config;
    }
};

module.exports = nextConfig;
