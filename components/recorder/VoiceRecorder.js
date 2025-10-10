import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useVoiceRecording } from './useVoiceRecording';
import { RecordingButton } from './RecordingButton';
import { TranscriptDisplay } from './TranscriptDisplay';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceBookingConfirmationModal } from './VoiceBookingConfirmationModal';

/**
 * Main voice recorder component with push-to-talk and transcription
 * @param {Object} props
 * @param {string} props.locale - Locale for speech recognition (default: 'it-IT')
 * @param {Function} props.onTranscriptComplete - Callback when transcript is complete
 * @param {Function} props.onError - Callback for errors
 * @param {boolean} props.showVisualizer - Whether to show audio visualizer (default: true)
 */
export const VoiceRecorder = ({
  locale = 'it-IT',
  onTranscriptComplete,
  onError,
  showVisualizer = true
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const [lastResult, setLastResult] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const {
    isRecording,
    isProcessing,
    transcript,
    partialTranscript,
    duration,
    durationFormatted,
    audioLevel,
    hasPermission,
    error,
    startRecording,
    stopRecording,
    requestPermission,
    submitToBackend
  } = useVoiceRecording({
    locale,
    onTranscriptComplete: async (result) => {
      setLastResult(result);
      
      // Automatically submit to backend
      try {
        const response = await submitToBackend(result);
        handleBackendResponse(response);
      } catch (err) {
        console.error('Failed to submit to backend:', err);
        setApiError(err.message || 'Failed to process voice booking');
        Alert.alert(
          t('Error'),
          t('Failed to process voice booking. Please try again or create booking manually.')
        );
      }
      
      // Also call parent callback if provided
      if (onTranscriptComplete) {
        onTranscriptComplete(result);
      }
    },
    onError: (err) => {
      if (onError) {
        onError(err);
      }
    }
  });
  
  // Handle backend response
  const handleBackendResponse = (response) => {
    switch (response.status) {
      case 'success':
        if (response.booking_id && response.booking) {
          // Booking was created! Show confirmation modal
          setBooking(response.booking);
          setShowConfirmationModal(true);
          setApiError(null);
        }
        break;
        
      case 'needs_clarification':
        // Show what's missing
        const missingFields = response.clarifications_needed
          .map(c => c.field)
          .join(', ');
        Alert.alert(
          t('Missing Information'),
          t(`Could not create booking. Missing: ${missingFields}. Please create booking manually.`)
        );
        break;
        
      case 'error':
        if (response.error_code === 'NO_TABLES_AVAILABLE') {
          // Show alternative times if available
          const alternatives = response.suggested_alternatives
            ?.map(alt => alt.time)
            .join(', ');
          Alert.alert(
            t('No Tables Available'),
            alternatives
              ? t(`No tables available at requested time. Try: ${alternatives}`)
              : t('No tables available at requested time.')
          );
        } else {
          Alert.alert(t('Error'), response.message);
        }
        break;
    }
  };
  
  // Handle booking confirmation
  const handleBookingConfirmed = (bookingId) => {
    Alert.alert(
      t('Success'),
      t('Booking confirmed successfully!'),
      [
        {
          text: t('OK'),
          onPress: () => {
            // Reset state
            setBooking(null);
            setLastResult(null);
          }
        }
      ]
    );
  };
  
  // Handle booking cancellation
  const handleBookingCancelled = (bookingId) => {
    Alert.alert(
      t('Cancelled'),
      t('Booking has been cancelled.'),
      [
        {
          text: t('OK'),
          onPress: () => {
            // Reset state
            setBooking(null);
            setLastResult(null);
          }
        }
      ]
    );
  };
  
  // Handle permission request
  const handlePermissionRequest = async () => {
    await requestPermission();
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.palette.background.default }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="microphone-variant"
          size={32}
          color={theme.palette.primary.main}
        />
        <Text style={[styles.title, { color: theme.palette.text.primary }]}>
          Voice Booking
        </Text>
        <Text style={[styles.subtitle, { color: theme.palette.text.secondary }]}>
          Press and hold to record your booking request
        </Text>
      </View>
      
      {/* Permission warning */}
      {!hasPermission && (
        <View style={[styles.warningBox, { backgroundColor: theme.palette.warning.light }]}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color={theme.palette.warning.dark}
          />
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: theme.palette.warning.dark }]}>
              Microphone Permission Required
            </Text>
            <Text style={[styles.warningText, { color: theme.palette.warning.dark }]}>
              Please grant microphone access to use voice booking.
            </Text>
          </View>
        </View>
      )}
      
      {/* Error display */}
      {error && (
        <View style={[styles.errorBox, { backgroundColor: theme.palette.error.light }]}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color={theme.palette.error.dark}
          />
          <Text style={[styles.errorText, { color: theme.palette.error.dark }]}>
            {error}
          </Text>
        </View>
      )}
      
      {/* Audio visualizer */}
      {showVisualizer && (
        <View style={styles.visualizerContainer}>
          <AudioVisualizer
            audioLevel={audioLevel}
            isRecording={isRecording}
          />
        </View>
      )}
      
      {/* Recording button with timer overlay */}
      <View style={styles.buttonContainer}>
        {/* Recording duration - positioned above button */}
        {isRecording && (
          <View style={styles.durationContainer}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={20}
              color={theme.palette.text.secondary}
            />
            <Text style={[styles.durationText, { color: theme.palette.text.secondary }]}>
              {durationFormatted}
            </Text>
          </View>
        )}
        
        <RecordingButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={!hasPermission}
        />
      </View>
      
      {/* Transcript display */}
      <View style={styles.transcriptContainer}>
        <TranscriptDisplay
          transcript={transcript}
          partialTranscript={partialTranscript}
          isRecording={isRecording}
          confidenceScore={lastResult?.confidenceScore}
          validation={lastResult?.validation}
        />
      </View>
      
      {/* Result info */}
      {lastResult && (
        <View style={styles.resultContainer}>
          {/* Needs recheck warning */}
          {lastResult.needsServerRecheck && (
            <View style={[styles.infoBox, { backgroundColor: theme.palette.info.light }]}>
              <MaterialCommunityIcons
                name="information"
                size={18}
                color={theme.palette.info.dark}
              />
              <Text style={[styles.infoText, { color: theme.palette.info.dark }]}>
                Low confidence detected. Audio will be sent to server for verification.
              </Text>
            </View>
          )}
          
          {/* Extracted tokens */}
          {lastResult.tokens && (
            <View style={styles.tokensContainer}>
              <Text style={[styles.tokensTitle, { color: theme.palette.text.secondary }]}>
                Detected Information:
              </Text>
              
              {lastResult.tokens.partySize && (
                <View style={styles.tokenRow}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={16}
                    color={theme.palette.text.secondary}
                  />
                  <Text style={[styles.tokenText, { color: theme.palette.text.primary }]}>
                    Party Size: {lastResult.tokens.partySize}
                  </Text>
                </View>
              )}
              
              {lastResult.tokens.timeSlot && (
                <View style={styles.tokenRow}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color={theme.palette.text.secondary}
                  />
                  <Text style={[styles.tokenText, { color: theme.palette.text.primary }]}>
                    Time: {lastResult.tokens.timeSlot}
                  </Text>
                </View>
              )}
              
              {lastResult.tokens.names && lastResult.tokens.names.length > 0 && (
                <View style={styles.tokenRow}>
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color={theme.palette.text.secondary}
                  />
                  <Text style={[styles.tokenText, { color: theme.palette.text.primary }]}>
                    Name: {lastResult.tokens.names.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
      
      {/* Help text - Collapsible */}
      <View style={styles.helpContainer}>
        <TouchableOpacity 
          style={styles.helpHeader}
          onPress={() => setShowTips(!showTips)}
        >
          <Text style={[styles.helpTitle, { color: theme.palette.text.secondary }]}>
            Tips for best results
          </Text>
          <MaterialCommunityIcons
            name={showTips ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.palette.text.secondary}
          />
        </TouchableOpacity>
        
        {showTips && (
          <View style={styles.helpContent}>
            <Text style={[styles.helpText, { color: theme.palette.text.secondary }]}>
              • Speak clearly and at a normal pace
            </Text>
            <Text style={[styles.helpText, { color: theme.palette.text.secondary }]}>
              • Include party size, time, and customer name
            </Text>
            <Text style={[styles.helpText, { color: theme.palette.text.secondary }]}>
              • Minimize background noise
            </Text>
            <Text style={[styles.helpText, { color: theme.palette.text.secondary }]}>
              • Example: "Table for 4 at 8 PM for Mario Rossi"
            </Text>
          </View>
        )}
      </View>
      
      {/* Booking Confirmation Modal */}
      <VoiceBookingConfirmationModal
        visible={showConfirmationModal}
        booking={booking}
        onConfirm={handleBookingConfirmed}
        onCancel={handleBookingCancelled}
        onClose={() => setShowConfirmationModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 20,
    gap: 20
  },
  header: {
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center'
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    alignItems: 'flex-start'
  },
  warningContent: {
    flex: 1,
    gap: 4
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  warningText: {
    fontSize: 12
  },
  errorBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    alignItems: 'center'
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500'
  },
  visualizerContainer: {
    marginVertical: 10
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    minHeight: 200, // Fixed height to prevent layout shift
    justifyContent: 'center'
  },
  durationContainer: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums']
  },
  transcriptContainer: {
    marginTop: 10
  },
  resultContainer: {
    gap: 12
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    alignItems: 'center'
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500'
  },
  tokensContainer: {
    gap: 8
  },
  tokensTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  tokenText: {
    fontSize: 14
  },
  helpContainer: {
    marginTop: 10
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  helpContent: {
    gap: 6,
    marginTop: 4,
    paddingTop: 8
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18
  }
});
