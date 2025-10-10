# 🎤 Voice Recording Feature - Production Deployment Guide

## Overview

This guide explains how to deploy the voice recording feature to production iOS and Android devices with real speech-to-text functionality.

## Current Status

### ✅ What Works Now (Development)
- **Web (Chrome/Edge)**: Full speech-to-text using Web Speech API
- **iOS/Android (Expo Go)**: Demo mode with simulated transcripts
- **UI/UX**: Complete with animations, visualizations, and feedback

### 🚀 What's Needed for Production
- Install `@react-native-voice/voice` for native speech recognition
- Create development/production builds (can't use Expo Go)
- Deploy to App Store / Play Store

---

## Production Setup Steps

### Step 1: Install Dependencies

```bash
npm install @react-native-voice/voice
```

### Step 2: Configuration Already Done ✅

The following have been pre-configured:

**app.config.js:**
- ✅ iOS permissions (`NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`)
- ✅ Android permissions (`RECORD_AUDIO`, `INTERNET`)
- ✅ Voice plugin configuration

**Code:**
- ✅ `useVoiceRecording.js` hook supports both Web Speech API and native Voice
- ✅ Automatic platform detection (web vs native)
- ✅ Fallback to demo mode if Voice not installed

---

## Building for Production

### Option 1: EAS Build (Recommended)

#### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Login to Expo
```bash
eas login
```

#### 3. Configure EAS
```bash
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.tideexperience.bookingapp"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### 4. Build for iOS
```bash
# Development build (for testing)
eas build --profile development --platform ios

# Production build (for App Store)
eas build --profile production --platform ios
```

#### 5. Build for Android
```bash
# Development build (for testing)
eas build --profile development --platform android

# Production build (for Play Store)
eas build --profile production --platform android
```

#### 6. Install Development Build
```bash
# iOS
eas build:run --profile development --platform ios

# Android
eas build:run --profile development --platform android
```

### Option 2: Local Build (Advanced)

#### iOS (requires Mac)
```bash
npx expo prebuild --platform ios
cd ios
pod install
cd ..
npx expo run:ios
```

#### Android
```bash
npx expo prebuild --platform android
npx expo run:android
```

---

## Testing Production Build

### 1. Development Build Testing

After installing the development build:

1. **Start Metro bundler:**
   ```bash
   npm start
   ```

2. **Open the app** on your device
   - It will connect to Metro bundler
   - Real speech-to-text will work
   - No more demo mode!

3. **Test voice recording:**
   - Navigate to Bookings screen
   - Tap microphone icon
   - Hold button and speak in Italian
   - Release and see real transcript

### 2. Production Build Testing

Production builds are standalone (no Metro bundler needed):

1. **Install the production build** on device
2. **Open the app** (works offline)
3. **Test all features** including voice recording

---

## How It Works in Production

### Platform Detection

The code automatically detects the platform:

```javascript
if (Platform.OS === 'web') {
  // Use Web Speech API (Chrome/Edge)
  recognition.start();
} else if (Voice) {
  // Use native Voice library (iOS/Android)
  await Voice.start(locale);
} else {
  // Fallback to demo mode
  console.log('DEMO MODE');
}
```

### Speech Recognition Flow

**iOS:**
1. Uses Apple's Speech Recognition framework
2. On-device processing (privacy-focused)
3. Supports multiple languages including Italian (`it-IT`)

**Android:**
1. Uses Google Speech Recognition
2. Requires internet connection
3. Supports multiple languages

**Web:**
1. Uses Web Speech API
2. Works in Chrome and Edge
3. Requires HTTPS (or localhost)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Install `@react-native-voice/voice`
- [ ] Test on development build (iOS & Android)
- [ ] Verify speech recognition works in Italian
- [ ] Test all edge cases (no speech, background noise, etc.)
- [ ] Update app version in `app.config.js`

### iOS Deployment
- [ ] Create production build with EAS
- [ ] Test on TestFlight
- [ ] Submit to App Store
- [ ] App Store review (mention voice recording feature)

### Android Deployment
- [ ] Create production build with EAS
- [ ] Test with internal testing track
- [ ] Submit to Play Store
- [ ] Play Store review (mention voice recording feature)

---

## Environment Variables

### Development
```env
APP_ENV=development
```

### Production
```env
APP_ENV=production
```

The app automatically uses the correct API URL based on environment.

---

## Troubleshooting

### Issue: "Voice not installed" in production build

**Solution:**
1. Make sure `@react-native-voice/voice` is in `package.json` dependencies
2. Rebuild the app with `eas build`
3. Don't use Expo Go (it doesn't support custom native modules)

### Issue: Speech recognition not working on iOS

**Solution:**
1. Check iOS Settings → Privacy → Speech Recognition
2. Ensure app has permission
3. Check device language settings
4. Try different locale (e.g., `en-US` for testing)

### Issue: Speech recognition not working on Android

**Solution:**
1. Ensure device has internet connection
2. Check microphone permissions
3. Try Google app voice search to verify device capability

### Issue: Demo mode still showing in production

**Solution:**
1. Verify `@react-native-voice/voice` is installed
2. Check console logs for "Native Voice recognition" message
3. Rebuild app (don't use cached build)

---

## Monitoring & Analytics

### Recommended Tracking

Track these metrics in production:

```javascript
// In onTranscriptComplete callback
analytics.track('voice_booking_completed', {
  duration: result.duration,
  confidenceScore: result.confidenceScore,
  wordCount: result.wordCount,
  hasPartySize: result.validation.hasPartySize,
  hasTimeSlot: result.validation.hasTimeSlot,
  hasName: result.validation.hasName,
  needsServerRecheck: result.needsServerRecheck,
  locale: result.locale
});
```

### Key Metrics
- **Success rate**: Transcripts with all required fields
- **Confidence scores**: Average and distribution
- **Server recheck rate**: How often low-confidence uploads happen
- **Error rate**: Speech recognition failures
- **Usage by locale**: Which languages are used most

---

## Cost Considerations

### Free Tier
- **iOS**: Apple Speech Recognition is free and on-device
- **Android**: Google Speech Recognition is free (requires internet)
- **Web**: Web Speech API is free

### Paid Options (Future)
If you need server-side transcription for low-confidence recordings:
- **OpenAI Whisper API**: $0.006/minute
- **Google Cloud Speech-to-Text**: $0.016/minute
- **Azure Speech Services**: $1/hour

---

## Next Steps

1. **Install the library:**
   ```bash
   npm install @react-native-voice/voice
   ```

2. **Create a development build:**
   ```bash
   eas build --profile development --platform ios
   ```

3. **Test on your device**

4. **When ready, create production build:**
   ```bash
   eas build --profile production --platform ios
   eas build --profile production --platform android
   ```

5. **Submit to app stores**

---

## Support

For issues or questions:
- Check logs in development build
- Review `useVoiceRecording.js` console logs
- Test on web first (easier debugging)
- Refer to [@react-native-voice/voice docs](https://github.com/react-native-voice/voice)

---

## Summary

✅ **Development**: Works with demo mode in Expo Go
✅ **Web**: Full functionality with Web Speech API  
🚀 **Production**: Requires development/production build with `@react-native-voice/voice`

The code is **production-ready** - just install the library and build!
