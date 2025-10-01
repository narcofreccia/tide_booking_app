import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { useStateContext } from '../context/ContextProvider';

export default function BookingsScreen() {
  const theme = useTheme();
  const { currentUser } = useStateContext();
  const styles = createStyles(theme);

  // Mock bookings data
  const mockBookings = [
    { id: 1, customerName: 'John Doe', date: '2025-10-05', time: '19:00', guests: 4, status: 'confirmed' },
    { id: 2, customerName: 'Jane Smith', date: '2025-10-05', time: '20:00', guests: 2, status: 'confirmed' },
    { id: 3, customerName: 'Mike Johnson', date: '2025-10-06', time: '18:30', guests: 6, status: 'pending' },
    { id: 4, customerName: 'Sarah Williams', date: '2025-10-06', time: '19:30', guests: 3, status: 'confirmed' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Manage your restaurant reservations</Text>
      </View>

      <ScrollView style={styles.content}>
        {mockBookings.map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.customerName}>{booking.customerName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <Text style={styles.detailText}>📅 {booking.date}</Text>
              <Text style={styles.detailText}>🕐 {booking.time}</Text>
              <Text style={styles.detailText}>👥 {booking.guests} guests</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  bookingCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
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
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.background.default,
    textTransform: 'uppercase',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
});
