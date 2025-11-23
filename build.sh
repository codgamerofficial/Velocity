#!/bin/bash
# Fix permissions on vite binary
chmod +x node_modules/.bin/vite
# Run vite build
node_modules/.bin/vite build
