export default {
  expo: {
    name: "Tide Booking App",
    slug: "tide-booking-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/tide_favicon_apple.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/tide_splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tideexperience.bookingapp",
      buildNumber: "3",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription: "This app needs access to your microphone to record voice bookings.",
        NSSpeechRecognitionUsageDescription: "This app needs access to speech recognition to transcribe your voice bookings.",
        NSPhotoLibraryUsageDescription: "This app does not access your photo library. This permission is required by a third-party library."
      }
    },
    android: {
      package: "com.tideexperience.bookingapp",
      versionCode: 3,
      permissions: [
        "RECORD_AUDIO",
        "INTERNET"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/tide_favicon_apple.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/tide_favicon_apple.png"
    },
    plugins: [
      "expo-secure-store",
      [
        "@react-native-voice/voice",
        {
          microphonePermission: "This app needs access to your microphone to record voice bookings.",
          speechRecognitionPermission: "This app needs access to speech recognition to transcribe your voice bookings."
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            useAndroidX: true,
            enableProguardInReleaseBuilds: true,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            minSdkVersion: 24,
            packagingOptions: {
              pickFirst: ['**/libc++_shared.so']
            }
          }
        }
      ]
    ],
    extra: {
      // Use environment variables from eas.json or .env (local dev)
      tideSupportPage: process.env.TIDE_SUPPORT_URL || 'https://tideexperience.com/support',
      environment: process.env.APP_ENV || 'development',
      devServerUrl: process.env.DEV_SERVER_URL || "http://localhost:8000",
      devServerUrlExpoGo: process.env.DEV_SERVER_EXPO_URL || 'http://192.168.10.102:8000',
      prodServerUrl: process.env.PROD_SERVER_URL || "https://westpiersrl-a6a9f5c00dd1.herokuapp.com/",
      eas: {
        projectId: "a47117ba-73d5-414c-a3c0-9689c5dac633"
      }
    }
  }
};
