import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../theme';
import { BookingRowActions } from './BookingRowActions';

export const BookingRow = ({ booking, onPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const swipeableRef = useRef(null);

  const getStatusColor = (status) => {
    const statusColors = {
      pending: theme.palette.warning.main,
      confirmed: theme.palette.success.main,
      cancelled_by_user: theme.palette.error.main,
      cancelled_by_restaurant: theme.palette.error.dark,
      no_show: theme.palette.error.light,
      arrived: theme.palette.info.main,
      seated: theme.palette.info.dark,
      completed: theme.palette.success.dark,
    };
    return statusColors[status] || theme.palette.text.secondary;
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderRightActions = (progress, dragX) => {
    return (
      <BookingRowActions 
        booking={booking} 
        onActionComplete={() => swipeableRef.current?.close()}
      />
    );
  };

  const handleActionComplete = () => {
    swipeableRef.current?.close();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <TouchableOpacity 
        style={styles.bookingCard}
        onPress={() => onPress?.(booking)}
      >
      <View style={styles.bookingHeader}>
        <Text style={styles.customerName}>
          {booking.name} {booking.surname || ''}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{formatStatus(booking.status)}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.detailText}>🕐 {booking.arrival_time.substring(0, 5)}</Text>
        <Text style={styles.detailText}>
          👥 {booking.adults + booking.children} guests
        </Text>
        {booking.table_ids && booking.table_ids.length > 0 && (
          <Text style={styles.detailText}>
            🪑 Table {booking.table_ids.join(', ')}
          </Text>
        )}
      </View>
      
      {(booking.email || booking.phone) && (
        <View style={styles.contactInfo}>
          {booking.email && (
            <Text style={styles.contactText}>📧 {booking.email}</Text>
          )}
          {booking.phone && (
            <Text style={styles.contactText}>📞 {booking.phone}</Text>
          )}
        </View>
      )}
      
      {booking.costumer_notes && (
        <Text style={styles.notes}>💬 {booking.costumer_notes}</Text>
      )}
      </TouchableOpacity>
    </Swipeable>
  );
};

const createStyles = (theme) => StyleSheet.create({
  bookingCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  customerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    textTransform: 'capitalize',
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  contactInfo: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  contactText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  notes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
});
