import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { getBookingsByDate } from '../../services/api';
import { getIcon, getIconSize } from '../../config/icons';

/**
 * BookingSummaryBar
 * Displays total reservations and pax count for the selected date/interval
 */
export const BookingSummaryBar = ({ restaurantId, date, interval }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  // Fetch bookings for the selected date and interval
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings-summary', restaurantId, date, interval?.start_time, interval?.end_time],
    queryFn: () => getBookingsByDate(restaurantId, {
      reservation_date: date,
      start_time: interval?.start_time,
      end_time: interval?.end_time,
    }),
    enabled: !!restaurantId && !!date,
  });

  // Calculate totals
  const totalReservations = bookings.length;
  const totalPax = bookings.reduce((sum, booking) => {
    return sum + (booking.adults || 0) + (booking.children || 0);
  }, 0);

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <MaterialCommunityIcons
          name={getIcon('calendar')}
          size={getIconSize('sm')}
          color={theme.palette.primary.main}
        />
        <Text style={styles.statValue}>{totalReservations}</Text>
      </View>

      <View style={styles.statItem}>
        <MaterialCommunityIcons
          name={getIcon('guests')}
          size={getIconSize('sm')}
          color={theme.palette.secondary.main}
        />
        <Text style={styles.statValue}>{totalPax}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
});
