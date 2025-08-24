// Learn more https://docs.expo.dev/guides/monorepos

const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// #1 - Watch all files in the monorepo
config.watchFolders = [workspaceRoot];
// #3 - Force resolving nested modules to the folders below
config.resolver.disableHierarchicalLookup = true;
// #2 - Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Add extraNodeModules to force Metro to resolve certain packages from the workspace root
const extraNodeModules = {
  'react-native-reanimated-dnd': path.resolve(workspaceRoot, 'node_modules/react-native-reanimated-dnd'),
  'react-native-reanimated': path.resolve(workspaceRoot, 'node_modules/react-native-reanimated'),
};

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  ...extraNodeModules,
};

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, "node_modules", ".cache", "metro"),
  }),
];

// Ensure image assets are properly handled
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
];

// Ensure source extensions don't include image files
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => 
  !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
);

module.exports = config;
