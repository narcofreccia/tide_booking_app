import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getIcon, getIconSize } from '../../config/icons';

export const DayCard = ({ day, isToday, daySummary, onPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!day) {
    return <View style={styles.emptyCell} />;
  }

  const intervals = daySummary?.intervals || [];
  const isOpen = intervals.length > 0;

  // Calculate total bookings and pax for the day
  const totalBookings = intervals.reduce((sum, interval) => sum + interval.booking_count, 0);
  const totalPax = intervals.reduce((sum, interval) => sum + interval.total_pax, 0);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isToday && styles.cardToday,
        !isOpen && styles.cardClosed,
      ]}
      onPress={() => isOpen && onPress?.()}
      disabled={!isOpen}
    >
      {/* Day Number */}
      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
        {day}
      </Text>

      {/* Content */}
      {!isOpen ? (
        <View style={styles.closedContainer}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      ) : totalBookings > 0 ? (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons 
              name={getIcon('calendar')} 
              size={getIconSize('xs')} 
              color={theme.palette.primary.main} 
            />
            <Text style={styles.statText}>{totalBookings}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons 
              name={getIcon('guests')} 
              size={getIconSize('xs')} 
              color={theme.palette.secondary.main} 
            />
            <Text style={styles.statText}>{totalPax}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyDay}>
          <Text style={styles.emptyText}>No bookings</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    minHeight: 80,
    borderWidth: 1,
    borderColor: theme.palette.divider,
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  cardToday: {
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
  },
  cardClosed: {
    backgroundColor: theme.palette.background.elevated,
    opacity: 0.5,
  },
  emptyCell: {
    minHeight: 80,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  dayNumberToday: {
    color: theme.palette.primary.main,
  },
  closedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 54, // Fixed height to match statsContainer with marginTop
  },
  closedText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs, // 4px
    height: 50,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
  },
  emptyDay: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 54, // Fixed height to match statsContainer with marginTop
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
});
