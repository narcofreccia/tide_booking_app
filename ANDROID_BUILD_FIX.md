# Android Build Fix - AndroidX Conflict Resolution

## Problem

The Android build was failing with this error:

```
Attribute application@appComponentFactory value=(androidx.core.app.CoreComponentFactory) 
from [androidx.core:core:1.16.0] AndroidManifest.xml:28:18-86
is also present at [com.android.support:support-compat:28.0.0] AndroidManifest.xml:22:18-91 
value=(android.support.v4.app.CoreComponentFactory).
```

## Root Cause

**AndroidX vs Support Library Conflict:**
- Modern libraries use **AndroidX** (androidx.core:core:1.16.0)
- Some transitive dependencies still use old **Android Support Library** (com.android.support:support-compat:28.0.0 from 2018)
- These two cannot coexist - they define the same components with different package names

**Likely Culprits:**
- `@react-native-voice/voice` or one of its dependencies
- Other older native modules with transitive dependencies on support libraries

## Solution Implemented

We implemented a **three-layer defense** strategy:

### 1. **Jetifier** (app.config.js line 63)
```javascript
enableJetifier: true
```
- Automatically translates old support library references to AndroidX
- Gradle properties also set: `android.useAndroidX=true` and `android.enableJetifier=true`

### 2. **Gradle Exclusions** (plugins/androidGradlePlugin.js)
```javascript
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'animated-vector-drawable'
    exclude group: 'com.android.support', module: 'versionedparcelable'
}
```
- Forcefully excludes all old support library modules
- Prevents them from being pulled in as transitive dependencies

### 3. **Manifest Override** (plugins/androidManifestPlugin.js)
```xml
<application tools:replace="android:appComponentFactory">
```
- If any support library slips through, this overrides conflicts in the manifest
- Forces AndroidX version to win

## Files Modified

1. **app.config.js**
   - Added `enableJetifier: true`
   - Added gradle properties for AndroidX
   - Added custom config plugins

2. **plugins/androidManifestPlugin.js** (NEW)
   - Adds manifest conflict resolution

3. **plugins/androidGradlePlugin.js** (NEW)
   - Excludes old support libraries at dependency resolution level

## Why Not Just Replace the Library?

- `@react-native-voice/voice` is already at the latest version (3.2.4)
- The conflict comes from **transitive dependencies** (dependencies of dependencies)
- We can't control what third-party libraries depend on
- The exclusion + jetifier approach is the standard solution for this issue

## Next Steps

Run a new EAS build:
```bash
eas build --platform android --profile production
```

The build should now succeed with all old support libraries either:
1. Excluded entirely, OR
2. Automatically translated to AndroidX equivalents by Jetifier

## References

- [AndroidX Migration Guide](https://developer.android.com/jetpack/androidx/migrate)
- [Jetifier Documentation](https://www.npmjs.com/package/jetifier)
- [Expo Build Properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)
