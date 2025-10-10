import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useStateContext } from '../../context/ContextProvider';
import { getLocale } from '../../utils/localeUtils';
import {
  getMicrophonePermissionStatus,
  requestMicrophonePermission,
  isSpeechRecognitionAvailable,
  showPermissionDeniedAlert
} from '../../utils/permissionUtils';

const VOICE_RECORDING_ENABLED_KEY = '@voice_recording_enabled';
const VOICE_RECORDING_LOCALE_KEY = '@voice_recording_locale';
const VOICE_RECORDING_CONFIDENCE_KEY = '@voice_recording_confidence';

/**
 * Settings component for voice recording feature
 */
export const VoiceRecordingSettings = ({ onBack }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { language } = useStateContext();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(getLocale(language));
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [isLoading, setIsLoading] = useState(true);
  
  // Locale options based on available app languages
  const localeOptions = [
    { value: 'en-US', label: 'English (US)', icon: '🇺🇸' },
    { value: 'en-GB', label: 'English (UK)', icon: '🇬🇧' },
    { value: 'it-IT', label: 'Italiano (Italia)', icon: '🇮🇹' },
    { value: 'es-ES', label: 'Español (España)', icon: '🇪🇸' },
    { value: 'es-MX', label: 'Español (México)', icon: '🇲🇽' }
  ];
  
  const confidenceOptions = [
    { value: 60, label: '60% - Low (more server rechecks)' },
    { value: 70, label: '70% - Medium (recommended)' },
    { value: 80, label: '80% - High (fewer server rechecks)' }
  ];
  
  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);
  
  /**
   * Load saved settings from AsyncStorage
   */
  const loadSettings = async () => {
    try {
      const [enabled, locale, confidence] = await Promise.all([
        AsyncStorage.getItem(VOICE_RECORDING_ENABLED_KEY),
        AsyncStorage.getItem(VOICE_RECORDING_LOCALE_KEY),
        AsyncStorage.getItem(VOICE_RECORDING_CONFIDENCE_KEY)
      ]);
      
      if (enabled !== null) setIsEnabled(enabled === 'true');
      if (locale !== null) setSelectedLocale(locale);
      if (confidence !== null) setConfidenceThreshold(parseInt(confidence, 10));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading voice recording settings:', error);
      setIsLoading(false);
    }
  };
  
  /**
   * Check permission status
   */
  const checkPermissions = async () => {
    const { granted } = await getMicrophonePermissionStatus();
    const speechAvailable = await isSpeechRecognitionAvailable();
    
    setMicPermissionGranted(granted);
    setSpeechRecognitionAvailable(speechAvailable);
  };
  
  /**
   * Toggle voice recording feature
   */
  const handleToggleEnabled = async (value) => {
    if (value && !micPermissionGranted) {
      // Request permission if enabling
      const { granted, canAskAgain } = await requestMicrophonePermission();
      
      if (!granted) {
        if (!canAskAgain) {
          showPermissionDeniedAlert('microphone');
        }
        return;
      }
      
      setMicPermissionGranted(granted);
    }
    
    setIsEnabled(value);
    await AsyncStorage.setItem(VOICE_RECORDING_ENABLED_KEY, value.toString());
  };
  
  /**
   * Request microphone permission
   */
  const handleRequestPermission = async () => {
    const { granted, canAskAgain } = await requestMicrophonePermission();
    setMicPermissionGranted(granted);
    
    if (!granted && !canAskAgain) {
      showPermissionDeniedAlert('microphone');
    } else if (granted) {
      Alert.alert(
        'Permission Granted',
        'Microphone access has been granted. You can now use voice booking.',
        [{ text: 'OK' }]
      );
    }
  };
  
  /**
   * Change locale
   */
  const handleLocaleChange = async (locale) => {
    setSelectedLocale(locale);
    await AsyncStorage.setItem(VOICE_RECORDING_LOCALE_KEY, locale);
  };
  
  /**
   * Change confidence threshold
   */
  const handleConfidenceChange = async (threshold) => {
    setConfidenceThreshold(threshold);
    await AsyncStorage.setItem(VOICE_RECORDING_CONFIDENCE_KEY, threshold.toString());
  };
  
  const getPermissionIcon = (granted) => {
    return granted ? 'check-circle' : 'close-circle';
  };
  
  const getPermissionColor = (granted) => {
    return granted ? theme.palette.success.main : theme.palette.error.main;
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
        <Text style={{ color: theme.palette.text.primary }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
      {/* Back Button Header */}
      <View style={[styles.headerBar, { borderBottomColor: theme.palette.divider }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.palette.text.primary}
          />
          <Text style={[styles.backText, { color: theme.palette.text.primary }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="microphone-variant"
            size={48}
            color={theme.palette.primary.main}
          />
          <Text style={[styles.title, { color: theme.palette.text.primary }]}>
            Voice Recording
          </Text>
          <Text style={[styles.subtitle, { color: theme.palette.text.secondary }]}>
            Configure voice booking settings and permissions
          </Text>
        </View>
      
      {/* Enable/Disable Toggle */}
      <View style={[styles.section, { backgroundColor: theme.palette.background.paper }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.palette.text.primary }]}>
              Enable Voice Booking
            </Text>
            <Text style={[styles.settingDescription, { color: theme.palette.text.secondary }]}>
              Allow staff to create bookings using voice commands
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={handleToggleEnabled}
            trackColor={{
              false: theme.palette.text.disabled,
              true: theme.palette.primary.light
            }}
            thumbColor={isEnabled ? theme.palette.primary.main : '#FFFFFF'}
          />
        </View>
      </View>
      
      {/* Permissions Section */}
      <View style={[styles.section, { backgroundColor: theme.palette.background.paper }]}>
        <Text style={[styles.sectionTitle, { color: theme.palette.text.primary }]}>
          Permissions
        </Text>
        
        {/* Microphone Permission */}
        <View style={styles.permissionRow}>
          <MaterialCommunityIcons
            name={getPermissionIcon(micPermissionGranted)}
            size={24}
            color={getPermissionColor(micPermissionGranted)}
          />
          <View style={styles.permissionInfo}>
            <Text style={[styles.permissionLabel, { color: theme.palette.text.primary }]}>
              Microphone Access
            </Text>
            <Text style={[styles.permissionStatus, { color: getPermissionColor(micPermissionGranted) }]}>
              {micPermissionGranted ? 'Granted' : 'Not Granted'}
            </Text>
          </View>
        </View>
        
        {/* Speech Recognition */}
        <View style={styles.permissionRow}>
          <MaterialCommunityIcons
            name={getPermissionIcon(speechRecognitionAvailable)}
            size={24}
            color={getPermissionColor(speechRecognitionAvailable)}
          />
          <View style={styles.permissionInfo}>
            <Text style={[styles.permissionLabel, { color: theme.palette.text.primary }]}>
              Speech Recognition
            </Text>
            <Text style={[styles.permissionStatus, { color: getPermissionColor(speechRecognitionAvailable) }]}>
              {speechRecognitionAvailable ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>
        
        {/* Request Permission Button */}
        {!micPermissionGranted && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.palette.primary.main }]}
            onPress={handleRequestPermission}
          >
            <MaterialCommunityIcons name="shield-check" size={20} color="#FFFFFF" />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Request Permissions
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Settings Section */}
      {isEnabled && (
        <>
          {/* Locale Selection */}
          <View style={[styles.section, { backgroundColor: theme.palette.background.paper }]}>
            <Text style={[styles.sectionTitle, { color: theme.palette.text.primary }]}>
              Default Language
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.palette.text.secondary }]}>
              Select the language for speech recognition
            </Text>
            
            {localeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionRow}
                onPress={() => handleLocaleChange(option.value)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[styles.optionLabel, { color: theme.palette.text.primary }]}>
                    {option.label}
                  </Text>
                </View>
                {selectedLocale === option.value && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={theme.palette.primary.main}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Confidence Threshold */}
          <View style={[styles.section, { backgroundColor: theme.palette.background.paper }]}>
            <Text style={[styles.sectionTitle, { color: theme.palette.text.primary }]}>
              Confidence Threshold
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.palette.text.secondary }]}>
              Minimum confidence level before sending audio to server for verification
            </Text>
            
            {confidenceOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionRow}
                onPress={() => handleConfidenceChange(option.value)}
              >
                <Text style={[styles.optionLabel, { color: theme.palette.text.primary }]}>
                  {option.label}
                </Text>
                {confidenceThreshold === option.value && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={theme.palette.primary.main}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      
      {/* Info Section */}
      <View style={[styles.infoBox, { backgroundColor: theme.palette.info.light }]}>
        <MaterialCommunityIcons
          name="information"
          size={20}
          color={theme.palette.info.dark}
        />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: theme.palette.info.dark }]}>
            Privacy Notice
          </Text>
          <Text style={[styles.infoText, { color: theme.palette.info.dark }]}>
            Voice recordings are processed on-device when possible. Low-confidence recordings may be sent to our servers for verification and are automatically deleted after 14-30 days.
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  backText: {
    fontSize: 16,
    fontWeight: '500'
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 20,
    gap: 16
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center'
  },
  section: {
    borderRadius: 12,
    padding: 16,
    gap: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 8
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingInfo: {
    flex: 1,
    marginRight: 12
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 12
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8
  },
  permissionInfo: {
    flex: 1
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '500'
  },
  permissionStatus: {
    fontSize: 12,
    marginTop: 2
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  optionIcon: {
    fontSize: 24
  },
  optionLabel: {
    fontSize: 14
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    alignItems: 'flex-start'
  },
  infoContent: {
    flex: 1,
    gap: 4
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16
  }
});

// Export helper functions to get settings
export const getVoiceRecordingEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(VOICE_RECORDING_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error getting voice recording enabled status:', error);
    return false;
  }
};

export const getVoiceRecordingLocale = async () => {
  try {
    const locale = await AsyncStorage.getItem(VOICE_RECORDING_LOCALE_KEY);
    return locale || 'it-IT';
  } catch (error) {
    console.error('Error getting voice recording locale:', error);
    return 'it-IT';
  }
};

export const getVoiceRecordingConfidence = async () => {
  try {
    const confidence = await AsyncStorage.getItem(VOICE_RECORDING_CONFIDENCE_KEY);
    return confidence ? parseInt(confidence, 10) : 70;
  } catch (error) {
    console.error('Error getting voice recording confidence:', error);
    return 70;
  }
};
