#!/bin/bash

# Create lib directory if it doesn't exist
mkdir -p lib

# Copy the needed files from node_modules
cp node_modules/@datagram-network/conference-sdk/dist/index.mjs lib/datagram-conference.js

echo "SDK files copied to lib directory."
