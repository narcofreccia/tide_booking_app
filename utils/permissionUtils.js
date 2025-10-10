import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform, Alert, Linking } from 'react-native';

/**
 * Request microphone permission for audio recording
 * @returns {Promise<{granted: boolean, canAskAgain: boolean}>}
 */
export const requestMicrophonePermission = async () => {
  try {
    const { status, canAskAgain } = await Audio.requestPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain
    };
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return { granted: false, canAskAgain: false };
  }
};

/**
 * Get current microphone permission status
 * @returns {Promise<{granted: boolean, canAskAgain: boolean}>}
 */
export const getMicrophonePermissionStatus = async () => {
  try {
    const { status, canAskAgain } = await Audio.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain
    };
  } catch (error) {
    console.error('Error getting microphone permission status:', error);
    return { granted: false, canAskAgain: false };
  }
};

/**
 * Check if speech recognition is available on the device
 * Note: expo-speech doesn't have native speech-to-text, so we'll use Web Speech API
 * or plan for a native module in the future
 * @returns {Promise<boolean>}
 */
export const isSpeechRecognitionAvailable = async () => {
  // For now, we'll check if the platform supports it
  // In a real implementation, you'd check for native speech recognition capabilities
  if (Platform.OS === 'web') {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  
  // For native platforms, we'll assume it's available
  // In production, you'd integrate with react-native-voice or a similar library
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Request all necessary permissions for voice recording
 * @returns {Promise<{microphone: boolean, speechRecognition: boolean}>}
 */
export const requestAllVoicePermissions = async () => {
  const micPermission = await requestMicrophonePermission();
  const speechAvailable = await isSpeechRecognitionAvailable();
  
  return {
    microphone: micPermission.granted,
    speechRecognition: speechAvailable
  };
};

/**
 * Show settings alert when permissions are denied
 * @param {string} permissionType - Type of permission (microphone, speech)
 */
export const showPermissionDeniedAlert = (permissionType = 'microphone') => {
  const permissionName = permissionType === 'microphone' ? 'Microphone' : 'Speech Recognition';
  
  Alert.alert(
    `${permissionName} Permission Required`,
    `Please enable ${permissionName.toLowerCase()} access in your device settings to use voice booking.`,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        }
      }
    ]
  );
};

/**
 * Configure audio mode for recording
 * @returns {Promise<void>}
 */
export const configureAudioMode = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });
  } catch (error) {
    console.error('Error configuring audio mode:', error);
    throw error;
  }
};
