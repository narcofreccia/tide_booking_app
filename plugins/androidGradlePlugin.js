const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

const withGradleExclusions = (config) => {
  // Add exclusions to the app build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      const contents = config.modResults.contents;
      
      // Add configurations block to exclude old support libraries
      const exclusionBlock = `
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-v13'
    exclude group: 'com.android.support', module: 'animated-vector-drawable'
    exclude group: 'com.android.support', module: 'versionedparcelable'
}
`;
      
      // Insert before dependencies block if not already present
      if (!contents.includes('exclude group: \'com.android.support\'')) {
        const dependenciesIndex = contents.indexOf('dependencies {');
        if (dependenciesIndex !== -1) {
          config.modResults.contents = 
            contents.slice(0, dependenciesIndex) + 
            exclusionBlock + 
            '\n' + 
            contents.slice(dependenciesIndex);
        }
      }
    }
    return config;
  });
  
  return config;
};

module.exports = withGradleExclusions;
