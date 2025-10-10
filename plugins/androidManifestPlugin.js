const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidManifestFix = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Add tools namespace if not present
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    
    // Force AndroidX appComponentFactory to resolve conflicts
    if (androidManifest.manifest.application && androidManifest.manifest.application[0]) {
      const app = androidManifest.manifest.application[0];
      
      // Set the AndroidX value explicitly
      app.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';
      
      // Add tools:replace to override any conflicts
      if (app.$['tools:replace']) {
        // If tools:replace exists, append to it
        if (!app.$['tools:replace'].includes('android:appComponentFactory')) {
          app.$['tools:replace'] = app.$['tools:replace'] + ',android:appComponentFactory';
        }
      } else {
        // If tools:replace doesn't exist, create it
        app.$['tools:replace'] = 'android:appComponentFactory';
      }
    }
    
    return config;
  });
};

module.exports = withAndroidManifestFix;
