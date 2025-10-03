import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { BookingRowActions } from './BookingRowActions';
import { getIcon, getIconSize } from '../../config/icons';

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
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name={getIcon('time')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
          <Text style={styles.detailText}>{booking.arrival_time.substring(0, 5)}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name={getIcon('guests')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
          <Text style={styles.detailText}>
            {booking.adults + booking.children} guests
          </Text>
        </View>
        {booking.table_ids && booking.table_ids.length > 0 && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name={getIcon('table')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
            <Text style={styles.detailText}>
              Table {booking.table_ids.join(', ')}
            </Text>
          </View>
        )}
      </View>
      
      {(booking.email || booking.phone) && (
        <View style={styles.contactInfo}>
          {booking.email && (
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name={getIcon('email')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
              <Text style={styles.contactText}>{booking.email}</Text>
            </View>
          )}
          {booking.phone && (
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name={getIcon('phone')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
              <Text style={styles.contactText}>{booking.phone}</Text>
            </View>
          )}
        </View>
      )}
      
      {booking.costumer_notes && (
        <View style={styles.notesContainer}>
          <MaterialCommunityIcons name={getIcon('notes')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
          <Text style={styles.notes}>{booking.costumer_notes}</Text>
        </View>
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  contactInfo: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  contactText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
  notes: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
});
