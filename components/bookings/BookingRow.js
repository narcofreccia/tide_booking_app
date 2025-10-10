import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { BookingRowActions } from './BookingRowActions';
import { getIcon, getIconSize } from '../../config/icons';
import { useTranslation } from '../../hooks/useTranslation';  

export const BookingRow = ({ booking, tables = [], onPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const swipeableRef = useRef(null);

  // Helper function to get table numbers from table IDs
  const getTableNumbers = (tableIds) => {
    if (!tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return '';
    }
    
    return tableIds
      .map(id => {
        const table = tables.find(t => t.id === id);
        return table ? table.number : id;
      })
      .join(', ');
  };

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

  const handlePhonePress = () => {
    if (booking.phone) {
      Linking.openURL(`tel:${booking.phone}`);
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderRightActions = (progress, dragX) => {
    return (
      <BookingRowActions 
        booking={booking} 
        onActionComplete={() => {
          // Close swipeable after a small delay to ensure modal is fully closed
          setTimeout(() => {
            swipeableRef.current?.close();
          }, 100);
        }}
      />
    );
  };

  // Check booking source
  const isVoiceBooking = booking.restaurant_notes && 
                         typeof booking.restaurant_notes === 'string' && 
                         booking.restaurant_notes.includes('[AI]');
  
  const isOnlineBooking = booking.temp_id !== null && booking.temp_id !== undefined;

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
        <View style={styles.nameContainer}>
          <Text style={styles.customerName}>
            {booking.name} {booking.surname || ''}
          </Text>
          {/* Voice booking indicator */}
          {isVoiceBooking && (
            <MaterialCommunityIcons 
              name="microphone" 
              size={14} 
              color={theme.palette.primary.main} 
              style={styles.sourceIcon}
            />
          )}
          {/* Online booking indicator */}
          {isOnlineBooking && (
            <MaterialCommunityIcons 
              name="web" 
              size={14} 
              color={theme.palette.info.main} 
              style={styles.sourceIcon}
            />
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{formatStatus(t('bookingStatus.' + booking.status))}</Text>
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
            {booking.adults + booking.children} {t('bookings.guests')}
          </Text>
        </View>
        {booking.table_ids && booking.table_ids.length > 0 && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name={getIcon('table')} size={getIconSize('sm')} color={theme.palette.text.secondary} />
            <Text style={styles.detailText}>
              {t('bookings.table')} {getTableNumbers(booking.table_ids)}
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
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={handlePhonePress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name={getIcon('phone')} size={getIconSize('sm')} color={theme.palette.primary.main} />
              <Text style={[styles.contactText, styles.phoneText]}>{booking.phone}</Text>
            </TouchableOpacity>
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  sourceIcon: {
    marginLeft: 2,
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
  phoneText: {
    color: theme.palette.primary.main,
    textDecorationLine: 'underline',
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
