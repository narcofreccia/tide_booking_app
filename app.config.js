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
        NSSpeechRecognitionUsageDescription: "This app needs access to speech recognition to transcribe your voice bookings."
      }
    },
    android: {
      package: "com.tideexperience.bookingapp",
      versionCode: 3,
      permissions: [
        "RECORD_AUDIO",
        "INTERNET"
      ]
    },
    web: {
      favicon: "./assets/tide_favicon_apple.png"
    },
    plugins: [
      "expo-secure-store"
      // NOTE: Uncomment when ready for production build with real speech-to-text
      // [
      //   "@react-native-voice/voice",
      //   {
      //     microphonePermission: "This app needs access to your microphone to record voice bookings.",
      //     speechRecognitionPermission: "This app needs access to speech recognition to transcribe your voice bookings."
      //   }
      // ]
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
