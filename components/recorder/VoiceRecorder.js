import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useStateContext, useDispatchContext } from '../../context/ContextProvider';
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
  const dispatch = useDispatchContext();
  
  const [lastResult, setLastResult] = useState(null);
  const [booking, setBooking] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
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
    resetTranscript,
    submitToBackend
  } = useVoiceRecording({
    locale,
    onTranscriptComplete: async (result) => {
      setLastResult(result);
      
      // Automatically submit to backend
      try {
        dispatch({ type: 'START_LOADING' });
        console.log('Submitting to backend...');
        const response = await submitToBackend(result);
        console.log('Backend response received:', response);
        dispatch({ type: 'END_LOADING' });
        handleBackendResponse(response);
      } catch (err) {
        dispatch({ type: 'END_LOADING' });
        console.error('Failed to submit to backend (caught error):', err);
        console.error('Error details:', err.response?.data || err.message);
        
        // Try to extract detailed error message from backend
        let errorMessage = t('voice_booking.failedToProcess');
        
        if (err.response?.data?.detail) {
          // FastAPI validation errors
          if (Array.isArray(err.response.data.detail)) {
            const errors = err.response.data.detail.map(e => e.msg).join(', ');
            errorMessage = `${t('voice_booking.failedToProcess')} ${errors}`;
          } else if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
          }
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'error',
            message: errorMessage
          }
        });
        // Clear transcript on submission error so user can try again
        resetTranscript();
      }
      
      // Also call parent callback if provided
      if (onTranscriptComplete) {
        onTranscriptComplete(result);
      }
    },
    onError: (err) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: err.message || t('voice_booking.recordingError')
        }
      });
      if (onError) {
        onError(err);
      }
    }
  });
  
  // Handle backend response
  const handleBackendResponse = (response) => {
    console.log('Handling backend response status:', response.status);
    
    switch (response.status) {
      case 'success':
        if (response.booking_id && response.booking) {
          // Booking was created! Show confirmation modal
          setBooking(response.booking);
          setShowConfirmationModal(true);
          dispatch({
            type: 'UPDATE_ALERT',
            payload: {
              open: true,
              severity: 'success',
              message: t('voice_booking.bookingCreated'),
            },
          });
        } else {
          // Success status but no booking - might be closed or unavailable
          dispatch({
            type: 'UPDATE_ALERT',
            payload: {
              open: true,
              severity: 'warning',
              message: response.message || t('voice_booking.couldNotCreateAtThisTime'),
            },
          });
          // Clear transcript so user can try again later
          resetTranscript();
        }
        break;
        
      case 'needs_clarification':
        // Show clarification messages from backend
        console.log('Clarifications needed:', response.clarifications_needed);
        let clarificationMessage = '';
        
        if (response.clarifications_needed && response.clarifications_needed.length > 0) {
          clarificationMessage = response.clarifications_needed
            .map(c => c.message || c.field)
            .join(' ');
        }
        
        // Fallback to generic message if no clarifications provided
        if (!clarificationMessage) {
          const fields = response.clarifications_needed
            ?.map(c => c.field)
            .join(', ') || 'information';
          clarificationMessage = t('voice_booking.couldNotCreateBooking').replace('{fields}', fields);
        }
        
        console.log('Showing clarification alert:', clarificationMessage);
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'warning',
            message: clarificationMessage,
          },
        });
        // Clear transcript so user can record again with missing info
        resetTranscript();
        break;
        
      case 'error':
       
        
        if (response.error_code === 'NO_TABLES_AVAILABLE') {
          // Show alternative times if available
          const alternatives = response.suggested_alternatives
            ?.map(alt => alt.time)
            .join(', ');
          const message = alternatives
            ? t('voice_booking.noTablesAvailableTry').replace('{alternatives}', alternatives)
            : t('voice_booking.noTablesAvailable');
          
          // Use setTimeout to ensure dispatch happens after any other state updates
          setTimeout(() => {
            dispatch({
              type: 'UPDATE_ALERT',
              payload: {
                open: true,
                severity: 'warning',
                message: message,
              },
            });
    
          }, 100);
        } else {
          dispatch({
            type: 'UPDATE_ALERT',
            payload: {
              open: true,
              severity: 'error',
              message: response.message || t('voice_booking.errorOccurred'),
            },
          });
        }
        // Clear transcript so user can try again
        resetTranscript();
        break;
        
      default:
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'error',
            message: t('voice_booking.unexpectedResponse'),
          },
        });
        // Clear transcript on unexpected response
        resetTranscript();
    }
  };
  
  // Handle booking confirmation
  const handleBookingConfirmed = (bookingId) => {
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'success',
        message: t('voice_booking.bookingConfirmedSuccess')
      }
    });
    // Reset state
    setBooking(null);
    setLastResult(null);
    setShowConfirmationModal(false);
    // Clear transcript to prevent re-submission
    resetTranscript();
  };
  
  // Handle booking cancellation
  const handleBookingCancelled = (bookingId) => {
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'info',
        message: t('voice_booking.bookingCancelled')
      }
    });
    // Reset state
    setBooking(null);
    setLastResult(null);
    setShowConfirmationModal(false);
    // Clear transcript to prevent re-submission
    resetTranscript();
  };
  
  // Handle permission request
  const handlePermissionRequest = async () => {
    await requestPermission();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="microphone-variant"
          size={28}
          color={theme.palette.primary.main}
        />
        <Text style={[styles.title, { color: theme.palette.text.primary }]}>
          {t('voice_booking.voiceBooking')}
        </Text>
      </View>
      
      {/* Error/Warning messages - compact */}
      {!hasPermission && (
        <View style={[styles.alert, { backgroundColor: theme.palette.warning.light }]}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={theme.palette.warning.dark} />
          <Text style={[styles.alertText, { color: theme.palette.warning.dark }]}>
            {t('voice_booking.microphonePermissionRequired')}
          </Text>
        </View>
      )}
      
      {error && (
        <View style={[styles.alert, { backgroundColor: theme.palette.error.light }]}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={theme.palette.error.dark} />
          <Text style={[styles.alertText, { color: theme.palette.error.dark }]}>{error}</Text>
        </View>
      )}
      
      {/* Recording timer - fixed position top right */}
      {isRecording && (
        <View style={styles.timerContainer}>
          <View style={styles.timerBadge}>
            <View style={[styles.recordingDot, { backgroundColor: theme.palette.error.main }]} />
            <Text style={[styles.timerText, { color: theme.palette.text.primary }]}>
              {durationFormatted}
            </Text>
          </View>
        </View>
      )}
      
      {/* Main content area */}
      <View style={styles.mainContent}>
        {/* Visualizer */}
        {showVisualizer && (
          <AudioVisualizer
            audioLevel={audioLevel}
            isRecording={isRecording}
          />
        )}
        
        {/* Recording button */}
        <View style={styles.recordingSection}>
          <RecordingButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={!hasPermission}
          />
          
          <Text style={[styles.instruction, { color: theme.palette.text.secondary }]}>
            {t('voice_booking.pressAndHold')}
          </Text>
        </View>
        
        {/* Transcript area - flex to fill remaining space */}
        <View style={styles.transcriptSection}>
          <TranscriptDisplay
            transcript={transcript}
            partialTranscript={partialTranscript}
            isRecording={isRecording}
            confidenceScore={lastResult?.confidenceScore}
            validation={lastResult?.validation}
          />
        </View>
      </View>
      
      {/* Bottom info bar - only show when needed */}
      {lastResult?.needsServerRecheck && (
        <View style={[styles.bottomInfo, { backgroundColor: theme.palette.info.light }]}>
          <MaterialCommunityIcons name="information" size={14} color={theme.palette.info.dark} />
          <Text style={[styles.bottomInfoText, { color: theme.palette.info.dark }]}>
            {t('voice_booking.lowConfidenceWarning')}
          </Text>
        </View>
      )}
      
      {/* Booking Confirmation Modal */}
      <VoiceBookingConfirmationModal
        visible={showConfirmationModal}
        booking={booking}
        onConfirm={handleBookingConfirmed}
        onCancel={handleBookingCancelled}
        onClose={() => setShowConfirmationModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500'
  },
  timerContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between'
  },
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 20
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  instruction: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center'
  },
  transcriptSection: {
    flex: 1,
    marginTop: 16
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    borderRadius: 8,
    marginTop: 12
  },
  bottomInfoText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500'
  }
});
