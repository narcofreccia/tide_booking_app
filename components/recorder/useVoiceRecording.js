import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import ENV from '../../config/env';

// Conditionally import Voice for native platforms
let Voice = null;
if (Platform.OS !== 'web') {
  try {
    Voice = require('@react-native-voice/voice').default;
  } catch (e) {
    console.warn('react-native-voice not installed, using demo mode');
  }
}
import {
  getMicrophonePermissionStatus,
  requestMicrophonePermission,
  configureAudioMode,
  showPermissionDeniedAlert
} from '../../utils/permissionUtils';
import {
  calculateConfidenceScore,
  hasNumbers,
  hasTimeReferences,
  hasNameReferences,
  extractCriticalTokens,
  needsServerRecheck,
  validateTranscript,
  formatDuration
} from '../../utils/audioUtils';
import { submitVoiceIntent } from '../../services/voiceApi';
import { useStateContext } from '../../context/ContextProvider';

/**
 * Custom hook for voice recording with speech-to-text
 * @param {Object} options - Hook options
 * @param {string} options.locale - Locale for speech recognition (default: 'it-IT')
 * @param {Function} options.onTranscriptComplete - Callback when transcript is complete
 * @param {Function} options.onError - Callback for errors
 * @returns {Object} Recording state and controls
 */
export const useVoiceRecording = ({
  locale = 'it-IT',
  onTranscriptComplete,
  onError
} = {}) => {
  // Get user and restaurant context
  const { currentUser, selectedRestaurant } = useStateContext();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const recordingRef = useRef(null);
  const recognitionRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const isRecordingRef = useRef(false); // Track recording state for callbacks
  
  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
    
    return () => {
      // Cleanup on unmount
      if (recordingRef.current) {
        stopRecording();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);
  
  /**
   * Check if microphone permission is granted
   */
  const checkPermissions = async () => {
    const { granted } = await getMicrophonePermissionStatus();
    setHasPermission(granted);
  };
  
  /**
   * Request microphone permission
   */
  const requestPermission = async () => {
    const { granted, canAskAgain } = await requestMicrophonePermission();
    setHasPermission(granted);
    
    if (!granted && !canAskAgain) {
      showPermissionDeniedAlert('microphone');
    }
    
    return granted;
  };
  
  /**
   * Initialize speech recognition (Web Speech API or native Voice)
   */
  const initializeSpeechRecognition = () => {
    if (Platform.OS === 'web') {
      // Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        console.log('Initializing Web Speech API with locale:', locale);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = locale;
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
        };
        
        recognition.onresult = (event) => {
          console.log('Speech recognition result event:', event);
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            console.log(`Result ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            console.log('Final transcript:', finalTranscript);
            setTranscript(prev => prev + finalTranscript);
          }
          if (interimTranscript) {
            console.log('Interim transcript:', interimTranscript);
            setPartialTranscript(interimTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          const errorMsg = `Speech recognition error: ${event.error}`;
          setError(errorMsg);
          if (onError) onError(errorMsg);
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended, isRecordingRef:', isRecordingRef.current);
          // Auto-restart if still recording (Web Speech API stops on silence)
          if (isRecordingRef.current && recognitionRef.current) {
            console.log('Auto-restarting speech recognition...');
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn('Failed to restart recognition:', e);
            }
          }
        };
        
        recognitionRef.current = recognition;
      } else {
        console.warn('Web Speech API not available in this browser');
        const errorMsg = 'Speech recognition not available in this browser. Please use Chrome or Edge.';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } else if (Voice) {
      // Native Voice Recognition (iOS/Android)
      console.log('Initializing native Voice recognition with locale:', locale);
      
      Voice.onSpeechStart = () => {
        console.log('Native speech recognition started');
      };
      
      Voice.onSpeechResults = (event) => {
        console.log('Native speech results:', event.value);
        if (event.value && event.value.length > 0) {
          const newTranscript = event.value[0];
          console.log('Final transcript:', newTranscript);
          setTranscript(newTranscript);
        }
      };
      
      Voice.onSpeechPartialResults = (event) => {
        console.log('Native partial results:', event.value);
        if (event.value && event.value.length > 0) {
          const partialText = event.value[0];
          console.log('Partial transcript:', partialText);
          setPartialTranscript(partialText);
        }
      };
      
      Voice.onSpeechError = (event) => {
        console.error('Native speech error:', event.error);
        const errorMsg = `Speech recognition error: ${event.error?.message || 'Unknown error'}`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
      };
      
      Voice.onSpeechEnd = () => {
        console.log('Native speech recognition ended');
      };
      
      recognitionRef.current = Voice;
    } else {
      // DEMO MODE: No speech recognition available
      console.log('Platform is not web and Voice not installed');
      console.log('DEMO MODE: Will simulate transcription after recording');
    }
  };
  
  /**
   * Start recording
   */
  const startRecording = async () => {
    try {
      // Check permission
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }
      
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Configure audio mode
      await configureAudioMode();
      
      // Start audio recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      if (recognitionRef.current) {
        console.log('Starting speech recognition...');
        if (Platform.OS === 'web') {
          recognitionRef.current.start();
        } else if (Voice) {
          await Voice.start(locale);
        }
      } else {
        console.warn('Speech recognition not initialized');
      }
      
      // Start duration tracking
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
        
        // Auto-stop after 60 seconds
        if (elapsed >= 60000) {
          stopRecording();
        }
      }, 100);
      
      // Update state
      setIsRecording(true);
      isRecordingRef.current = true; // Update ref for callbacks
      setTranscript('');
      setPartialTranscript('');
      setError(null);
      
      // Start monitoring audio levels (if available)
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // Normalize metering to 0-100 range
          const normalized = Math.max(0, Math.min(100, (status.metering + 160) / 160 * 100));
          setAudioLevel(normalized);
        }
      });
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      const errorMsg = 'Failed to start recording';
      setError(errorMsg);
      if (onError) onError(err);
    }
  };
  
  /**
   * Stop recording and process transcript
   */
  const stopRecording = async () => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setIsProcessing(true);
      
      // Stop duration tracking
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        if (Platform.OS === 'web') {
          recognitionRef.current.stop();
        } else if (Voice) {
          await Voice.stop();
          await Voice.destroy();
        }
        recognitionRef.current = null;
      }
      
      // Stop audio recording
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        
        // Process the recording
        await processRecording(uri);
      }
      
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref for callbacks
      setIsProcessing(false);
      setAudioLevel(0);
      
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording');
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref for callbacks
      setIsProcessing(false);
      if (onError) onError(err);
    }
  };
  
  /**
   * Process the completed recording
   */
  const processRecording = async (audioUri) => {
    try {
      let finalTranscript = transcript.trim();
      
      // DEMO MODE: Only trigger in development when Voice is NOT available (Expo Go)
      // NEVER trigger in production, even if Voice fails
      const isDevelopment = ENV.environment === 'development';
      if (!finalTranscript && Platform.OS !== 'web' && !Voice && isDevelopment && duration > 500) {
        const demoTranscripts = [
          // Italian - mix of words and numbers
          'Tavolo per quattro persone alle 20:00 per Mario Rossi',
          'Prenotazione per 2 alle 19:30 nome Giulia Bianchi',
          'Tavolo per sei persone domani sera alle 21:00 a nome Ferrari',
          'Per 3 persone alle 20:30 nome Luca Verdi',
          'Prenotazione per cinque stasera alle 19:00 nome Colombo',
          'Tavolo per 8 alle 22:00 per la famiglia Bianchi',
          'Per due persone alle 18:45 nome Andrea Conti',
          'Tavolo per 4 alle 20:15 per Elena Romano',
          // English - mix of words and numbers
          'Table for 4 people at 20:00 for John Smith',
          'Reservation for two at 19:30 name Sarah Johnson',
          'Table for 6 people tomorrow evening at 21:00 for Williams',
          'For three people at 20:30 name Michael Brown',
          'Booking for 5 tonight at 19:00 name David Miller',
          'Table for 2 at 18:30 for Emma Davis',
          'For four at 22:00 name Robert Taylor',
          'Table for two people at 19:15 for Jennifer Wilson',
          // Spanish - mix of words and numbers
          'Mesa para 4 personas a las 20:00 para Carlos García',
          'Reserva para dos a las 19:30 nombre María López',
          'Mesa para 6 personas mañana a las 21:00 a nombre de Martínez',
          'Para tres personas a las 20:30 nombre Juan Rodríguez',
          'Reserva para 5 esta noche a las 19:00 nombre Ana Fernández',
          'Mesa para 2 a las 18:30 para Luis Sánchez',
          'Para cuatro a las 22:00 nombre Isabel Moreno',
          'Mesa para dos personas a las 19:15 para Pedro Jiménez'
        ];
        finalTranscript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
        console.log('DEMO MODE: Generated transcript:', finalTranscript);
        setTranscript(finalTranscript);
      }
      
      const wordCount = finalTranscript.split(/\s+/).filter(w => w.length > 0).length;
      
      // Calculate confidence score
      const confidenceScore = calculateConfidenceScore({
        duration,
        transcript: finalTranscript,
        wordCount,
        hasNumbers: hasNumbers(finalTranscript),
        hasTimes: hasTimeReferences(finalTranscript)
      });
      
      // Extract critical tokens
      const tokens = extractCriticalTokens(finalTranscript);
      
      // Validate transcript
      const validation = validateTranscript(finalTranscript);
      
      // Determine if server recheck is needed
      const requiresRecheck = needsServerRecheck(confidenceScore);
      
      // Prepare result
      const result = {
        transcript: finalTranscript,
        duration,
        durationFormatted: formatDuration(duration),
        confidenceScore,
        wordCount,
        tokens,
        validation,
        needsServerRecheck: requiresRecheck,
        audioUri: requiresRecheck ? audioUri : null, // Only include audio if recheck needed
        locale,
        timestamp: new Date().toISOString()
      };
      
      // Call completion callback (for local display)
      if (onTranscriptComplete) {
        onTranscriptComplete(result);
      }
      
      return result;
      
    } catch (err) {
      console.error('Failed to process recording:', err);
      if (onError) onError(err);
    }
  };
  
  /**
   * Cancel recording
   */
  const cancelRecording = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref for callbacks
      setIsProcessing(false);
      setTranscript('');
      setPartialTranscript('');
      setDuration(0);
      setAudioLevel(0);
      
    } catch (err) {
      console.error('Failed to cancel recording:', err);
      setError('Failed to cancel recording');
      if (onError) onError(err);
    }
  };
  
  /**
   * Submit voice intent to backend
   * @param {Object} result - Result from processRecording
   * @returns {Promise} Backend response with booking data
   */
  const submitToBackend = async (result) => {
    try {
      setIsProcessing(true);
      
      // Prepare metadata
      const metadata = {
        staff_id: currentUser?.id,
        venue_id: selectedRestaurant?.id,
        app_version: '1.0.0',
        platform: Platform.OS
      };
      
      // Prepare audio file if needed
      let audioFile = null;
      if (result.needsServerRecheck && result.audioUri) {
        // Convert audio URI to blob/file for upload
        if (Platform.OS === 'web') {
          const response = await fetch(result.audioUri);
          audioFile = await response.blob();
        } else {
          // For native platforms, create file object from URI
          audioFile = {
            uri: result.audioUri,
            type: 'audio/m4a',
            name: 'recording.m4a'
          };
        }
      }
      
      // Submit to backend
      const response = await submitVoiceIntent({
        transcript: result.transcript,
        locale: result.locale,
        confidenceScore: result.confidenceScore,
        duration: result.duration,
        wordCount: result.wordCount,
        timestamp: result.timestamp,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        metadata,
        extractedTokens: result.tokens,
        validation: result.validation,
        needsServerRecheck: result.needsServerRecheck,
        audioFile
      });
      
      return response;
      
    } catch (err) {
      console.error('Failed to submit voice intent:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    // State
    isRecording,
    isProcessing,
    transcript,
    partialTranscript,
    duration,
    durationFormatted: formatDuration(duration),
    audioLevel,
    hasPermission,
    error,
    
    // Controls
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    checkPermissions,
    
    // API
    submitToBackend
  };
};
