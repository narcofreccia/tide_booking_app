import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Push-to-talk recording button with animated feedback
 * @param {Object} props
 * @param {boolean} props.isRecording - Whether recording is active
 * @param {Function} props.onPressIn - Callback when button is pressed
 * @param {Function} props.onPressOut - Callback when button is released
 * @param {boolean} props.disabled - Whether button is disabled
 */
export const RecordingButton = ({
  isRecording,
  isProcessing,
  onPressIn,
  onPressOut,
  disabled = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);
  
  // Scale animation on press
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
    if (onPressIn) onPressIn();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
    if (onPressOut) onPressOut();
  };
  
  const getButtonColor = () => {
    if (disabled) return theme.palette.text.disabled;
    if (isRecording) return theme.palette.error.main;
    return theme.palette.primary.main;
  };
  
  const getButtonText = () => {
    if (isProcessing) return t('voice_booking.processing');
    if (isRecording) return t('voice_booking.releaseToStop');
    return t('voice_booking.holdToSpeak');
  };
  
  const getIcon = () => {
    if (isProcessing) return 'loading';
    if (isRecording) return 'stop-circle';
    return 'microphone';
  };
  
  return (
    <View style={styles.container}>
      {/* Pulse ring when recording */}
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: theme.palette.error.main,
              opacity: 0.3,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />
      )}
      
      {/* Main button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isProcessing}
          style={[
            styles.button,
            {
              backgroundColor: getButtonColor(),
              ...theme.shadows.lg
            }
          ]}
        >
          <MaterialCommunityIcons
            name={getIcon()}
            size={48}
            color="#FFFFFF"
          />
        </Pressable>
      </Animated.View>
      
      {/* Instruction text */}
      <Text
        style={[
          styles.instructionText,
          { color: theme.palette.text.secondary }
        ]}
      >
        {getButtonText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    position: 'relative'
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: 20, // Match the paddingVertical to center it
    alignSelf: 'center'
  },
  instructionText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  }
});
