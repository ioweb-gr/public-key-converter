const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
    configureWebpack: {
        resolve: {
            fallback: {
                assert: require.resolve('assert/'),
                stream: require.resolve('stream-browserify'),
                util: require.resolve('util/'),
                crypto: require.resolve('crypto-browserify'),
                process: require.resolve('process/browser'),
                buffer: require.resolve('buffer/')
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer']
            })
        ]
    },
    devServer: {
        host: '0.0.0.0'
    },
    productionSourceMap: true // Enable source maps
});