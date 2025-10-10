import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';

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
  const { t } = useTranslation();
  
  // Only show partial text if it's DIFFERENT from final transcript
  const showPartial = partialTranscript && 
                      partialTranscript !== transcript && 
                      !transcript?.includes(partialTranscript);
  
  const hasContent = transcript || showPartial;
  
  const getConfidenceColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.paper }]}>
      {/* Header with recording indicator */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="text-box-outline"
          size={18}
          color={theme.palette.text.secondary}
        />
        <Text style={[styles.headerText, { color: theme.palette.text.secondary }]}>
          {t('voice_booking.transcript')}
        </Text>
        {isRecording && (
          <View style={styles.recordingBadge}>
            <View style={[styles.recordingDot, { backgroundColor: theme.palette.error.main }]} />
            <Text style={[styles.recordingText, { color: theme.palette.error.main }]}>
              {t('voice_booking.recording')}
            </Text>
          </View>
        )}
      </View>
      
      {/* Transcript content - no ScrollView, uses flex */}
      <View style={styles.content}>
        {hasContent ? (
          <>
            {/* Final transcript */}
            {transcript && (
              <Text style={[styles.transcriptText, { color: theme.palette.text.primary }]}>
                {transcript}
              </Text>
            )}
            
            {/* Partial transcript (only if different from final) */}
            {showPartial && (
              <Text style={[styles.partialText, { color: theme.palette.text.disabled }]}>
                {partialTranscript}
              </Text>
            )}
          </>
        ) : (
          <Text style={[styles.placeholderText, { color: theme.palette.text.disabled }]}>
            {isRecording ? t('voice_booking.listening') : t('voice_booking.pressAndHoldToStart')}
          </Text>
        )}
      </View>
      
      {/* Compact footer with validation badges */}
      {transcript && (
        <View style={styles.footer}>
          {/* Confidence + Validation badges in one row */}
          <View style={styles.footerRow}>
            {confidenceScore !== undefined && (
              <View style={[styles.badge, { backgroundColor: getConfidenceColor(confidenceScore) + '20' }]}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={12}
                  color={getConfidenceColor(confidenceScore)}
                />
                <Text style={[styles.badgeText, { color: getConfidenceColor(confidenceScore) }]}>
                  {confidenceScore}%
                </Text>
              </View>
            )}
            
            {validation?.hasPartySize && (
              <View style={[styles.badge, { backgroundColor: theme.palette.success.light }]}>
                <MaterialCommunityIcons name="account-group" size={12} color={theme.palette.success.dark} />
                <Text style={[styles.badgeText, { color: theme.palette.success.dark }]}>
                  {t('voice_booking.pax')}
                </Text>
              </View>
            )}
            
            {validation?.hasTimeSlot && (
              <View style={[styles.badge, { backgroundColor: theme.palette.success.light }]}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={theme.palette.success.dark} />
                <Text style={[styles.badgeText, { color: theme.palette.success.dark }]}>
                  {t('voice_booking.time')}
                </Text>
              </View>
            )}
            
            {validation?.hasName && (
              <View style={[styles.badge, { backgroundColor: theme.palette.success.light }]}>
                <MaterialCommunityIcons name="account" size={12} color={theme.palette.success.dark} />
                <Text style={[styles.badgeText, { color: theme.palette.success.dark }]}>
                  {t('voice_booking.name')}
                </Text>
              </View>
            )}
          </View>
          
          {/* Missing fields warning */}
          {validation?.missingFields?.length > 0 && (
            <View style={styles.warningRow}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={12}
                color={theme.palette.warning.main}
              />
              <Text style={[styles.warningText, { color: theme.palette.warning.main }]}>
                {t('voice_booking.missing')}: {validation.missingFields.join(', ')}
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
    flex: 1,
    borderRadius: 12,
    padding: 14,
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)'
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  recordingText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22
  },
  partialText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4
  },
  placeholderText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.6
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600'
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  warningText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '500'
  }
});
