// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo.
config.watchFolders = [workspaceRoot];

// 2. Resolve packages from both the app and the workspace root (hoisted node_modules).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Don't walk up the tree past these (pnpm hoisted layout).
config.resolver.disableHierarchicalLookup = true;

// NativeWind compiles ./global.css into the RN style runtime.
module.exports = withNativeWind(config, { input: './global.css' });
