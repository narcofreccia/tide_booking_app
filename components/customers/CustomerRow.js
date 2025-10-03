import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getIcon, getIconSize } from '../../config/icons';

export const CustomerRow = ({ customer, onPress }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fullName = [customer.name, customer.surname].filter(Boolean).join(' ') || 'Unknown';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <MaterialCommunityIcons
            name={getIcon('user')}
            size={getIconSize('lg')}
            color={theme.palette.primary.main}
          />
          <View>
            <Text style={styles.name}>{fullName}</Text>
            {customer.email && (
              <Text style={styles.email}>{customer.email}</Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons
          name={getIcon('chevronRight')}
          size={getIconSize('md')}
          color={theme.palette.text.secondary}
        />
      </View>

      {/* Contact Info */}
      <View style={styles.contactRow}>
        <MaterialCommunityIcons
          name={getIcon('phone')}
          size={getIconSize('sm')}
          color={theme.palette.text.secondary}
        />
        <Text style={styles.phone}>{customer.phone}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name={getIcon('calendar')}
            size={getIconSize('sm')}
            color={theme.palette.primary.main}
          />
          <Text style={styles.statLabel}>Total:</Text>
          <Text style={styles.statValue}>{customer.total_bookings}</Text>
        </View>

        {customer.no_show_count > 0 && (
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name={getIcon('close')}
              size={getIconSize('sm')}
              color={theme.palette.warning.main}
            />
            <Text style={styles.statLabel}>No-shows:</Text>
            <Text style={[styles.statValue, { color: theme.palette.warning.main }]}>
              {customer.no_show_count}
            </Text>
          </View>
        )}

        {customer.cancelled_by_user_count > 0 && (
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name={getIcon('cancel')}
              size={getIconSize('sm')}
              color={theme.palette.error.main}
            />
            <Text style={styles.statLabel}>Cancelled:</Text>
            <Text style={[styles.statValue, { color: theme.palette.error.main }]}>
              {customer.cancelled_by_user_count}
            </Text>
          </View>
        )}
      </View>

      {/* Last Booking */}
      <View style={styles.footer}>
        <Text style={styles.lastBookingLabel}>Last booking:</Text>
        <Text style={styles.lastBookingDate}>{formatDate(customer.last_booking_date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.palette.divider,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  email: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  phone: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
  },
  statValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
  lastBookingLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
  },
  lastBookingDate: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.palette.text.primary,
  },
});
