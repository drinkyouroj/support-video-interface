// Simple bundling script for Datagram SDK
// First install esbuild: npm install --save-dev esbuild

const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: ['./src/datagram-sdk-wrapper.js'],
  bundle: true,
  outfile: './lib/datagram-bundle.js',
  format: 'iife',
  globalName: 'DatagramSDK',
  minify: false,
  platform: 'browser',
  target: ['es2018']
});
