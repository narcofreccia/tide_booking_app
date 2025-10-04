import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getIcon, getIconSize } from '../../config/icons';
import { useTranslation } from '../../hooks/useTranslation';
import { useStateContext } from '../../context/ContextProvider';
import { getLocale } from '../../utils/localeUtils';

export const DayDetailsModal = ({ visible, onClose, day, date, daySummary }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { language } = useStateContext();
  const styles = createStyles(theme);

  if (!daySummary) return null;

  const intervals = daySummary.intervals || [];
  const totalBookings = intervals.reduce((sum, interval) => sum + interval.booking_count, 0);
  const totalPax = intervals.reduce((sum, interval) => sum + interval.total_pax, 0);

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const locale = getLocale(language);
    return dateObj.toLocaleDateString(locale, options);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.dayNumber}>{day}</Text>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons 
                name={getIcon('close')} 
                size={getIconSize('lg')} 
                color={theme.palette.text.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* Total Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('calendar.dailySummary')}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons 
                  name={getIcon('calendar')} 
                  size={getIconSize('xl')} 
                  color={theme.palette.primary.main} 
                />
                <Text style={styles.summaryStatNumber}>{totalBookings}</Text>
                <Text style={styles.summaryStatLabel}>{t(totalBookings === 1 ? 'calendar.booking' : 'calendar.bookings')}</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <MaterialCommunityIcons 
                  name={getIcon('guests')} 
                  size={getIconSize('xl')} 
                  color={theme.palette.secondary.main} 
                />
                <Text style={styles.summaryStatNumber}>{totalPax}</Text>
                <Text style={styles.summaryStatLabel}>{t(totalPax === 1 ? 'calendar.guest' : 'calendar.guests')}</Text>
              </View>
            </View>
          </View>

          {/* Time Intervals */}
          <ScrollView style={styles.intervalsContainer}>
            <Text style={styles.intervalsTitle}>{t('calendar.timeIntervals')}</Text>
            {intervals.map((interval, index) => (
              <View key={index} style={styles.intervalCard}>
                <View style={styles.intervalHeader}>
                  <MaterialCommunityIcons 
                    name={getIcon('time')} 
                    size={getIconSize('md')} 
                    color={theme.palette.primary.main} 
                  />
                  <Text style={styles.intervalTime}>
                    {interval.start_time.substring(0, 5)} - {interval.end_time.substring(0, 5)}
                  </Text>
                </View>
                <View style={styles.intervalStats}>
                  <View style={styles.intervalStat}>
                    <MaterialCommunityIcons 
                      name={getIcon('calendar')} 
                      size={getIconSize('sm')} 
                      color={theme.palette.text.secondary} 
                    />
                    <Text style={styles.intervalStatText}>
                      {interval.booking_count} {t(interval.booking_count === 1 ? 'calendar.booking' : 'calendar.bookings')}
                    </Text>
                  </View>
                  <View style={styles.intervalStat}>
                    <MaterialCommunityIcons 
                      name={getIcon('guests')} 
                      size={getIconSize('sm')} 
                      color={theme.palette.text.secondary} 
                    />
                    <Text style={styles.intervalStatText}>
                      {interval.total_pax} {t(interval.total_pax === 1 ? 'calendar.guest' : 'calendar.guests')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    ...theme.shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.primary.main,
  },
  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.xs,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  summaryCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  summaryStatNumber: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
  },
  summaryStatLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  intervalsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  intervalsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.md,
  },
  intervalCard: {
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.palette.divider,
  },
  intervalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  intervalTime: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  intervalStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingLeft: theme.spacing.lg + theme.spacing.sm,
  },
  intervalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  intervalStatText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
});
