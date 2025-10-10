import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

/**
 * Display for real-time transcript with partial results
 * @param {Object} props
 * @param {string} props.transcript - Final transcript text
 * @param {string} props.partialTranscript - Partial/interim transcript
 * @param {boolean} props.isRecording - Whether recording is active
 * @param {number} props.confidenceScore - Confidence score (0-100)
 * @param {Object} props.validation - Validation result
 */
export const TranscriptDisplay = ({
  transcript,
  partialTranscript,
  isRecording,
  confidenceScore,
  validation
}) => {
  const theme = useTheme();
  
  const hasContent = transcript || partialTranscript;
  
  const getConfidenceColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.paper }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="text-box-outline"
          size={20}
          color={theme.palette.text.secondary}
        />
        <Text style={[styles.headerText, { color: theme.palette.text.secondary }]}>
          Transcript
        </Text>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={[styles.recordingDot, { backgroundColor: theme.palette.error.main }]} />
            <Text style={[styles.recordingText, { color: theme.palette.error.main }]}>
              Recording
            </Text>
          </View>
        )}
      </View>
      
      {/* Transcript content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {hasContent ? (
          <View>
            {/* Final transcript */}
            {transcript && transcript.trim() !== '' && (
              <Text style={[styles.transcriptText, { color: theme.palette.text.primary }]}>
                {transcript}
              </Text>
            )}
            
            {/* Partial transcript (grayed out) */}
            {partialTranscript && partialTranscript.trim() !== '' && (
              <Text style={[styles.partialText, { color: theme.palette.text.disabled }]}>
                {partialTranscript}
              </Text>
            )}
          </View>
        ) : (
          <Text style={[styles.placeholderText, { color: theme.palette.text.disabled }]}>
            {isRecording ? 'Listening...' : 'Press and hold the button to start recording'}
          </Text>
        )}
      </ScrollView>
      
      {/* Confidence and validation info */}
      {transcript && confidenceScore !== undefined && (
        <View style={styles.footer}>
          {/* Confidence score */}
          <View style={styles.confidenceContainer}>
            <MaterialCommunityIcons
              name="chart-line"
              size={16}
              color={getConfidenceColor(confidenceScore)}
            />
            <Text style={[styles.confidenceText, { color: getConfidenceColor(confidenceScore) }]}>
              Confidence: {confidenceScore}%
            </Text>
          </View>
          
          {/* Validation badges */}
          {validation && (
            <View style={styles.badgesContainer}>
              {validation.hasPartySize && (
                <View style={[styles.badge, { backgroundColor: theme.palette.success.light }]}>
                  <MaterialCommunityIcons name="account-group" size={12} color={theme.palette.success.dark} />
                  <Text style={[styles.badgeText, { color: theme.palette.success.dark }]}>PAX</Text>
                </View>
              )}
              {validation.hasTimeSlot && (
                <View style={[styles.badge, { backgroundColor: theme.palette.success.light }]}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={theme.palette.success.dark} />
                  <Text style={[styles.badgeText, { color: theme.palette.success.dark }]}>Time</Text>
                </View>
              )}
              {validation.hasName && (
                <View style={[styles.badge, { backgroundColor: theme.palette.success.light }]}>
                  <MaterialCommunityIcons name="account" size={12} color={theme.palette.success.dark} />
                  <Text style={[styles.badgeText, { color: theme.palette.success.dark }]}>Name</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Missing fields warning */}
          {validation && validation.missingFields && validation.missingFields.length > 0 && (
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={14}
                color={theme.palette.warning.main}
              />
              <Text style={[styles.warningText, { color: theme.palette.warning.main }]}>
                Missing: {validation.missingFields.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    maxHeight: 300
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '600'
  },
  scrollView: {
    maxHeight: 150
  },
  scrollContent: {
    paddingBottom: 8
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4
  },
  partialText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic'
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600'
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600'
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  warningText: {
    fontSize: 11,
    fontWeight: '500'
  }
});
