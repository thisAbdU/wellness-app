const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, redirect ALL of WatermelonDB's sqlite adapter to empty module
  if (
    platform === 'web' &&
    moduleName.includes('@nozbe/watermelondb/adapters/sqlite')
  ) {
    return {
      filePath: path.resolve(__dirname, 'src/db/stubs/empty.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;