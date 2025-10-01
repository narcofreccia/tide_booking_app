import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { useStateContext } from '../context/ContextProvider';
import { useQuery } from '@tanstack/react-query';
import { listBookings } from '../services/api';
import { DateSelector } from '../components/DateSelector';
import { Pagination } from '../components/Pagination';

export default function BookingsScreen() {
  const theme = useTheme();
  const { selectedRestaurant, currentUser } = useStateContext();
  const styles = createStyles(theme);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch bookings
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', selectedRestaurant?.id , formatDate(selectedDate), searchQuery, currentPage],
    queryFn: () => listBookings({
      restaurant_id: selectedRestaurant?.id || currentUser?.id,
      startDate: formatDate(selectedDate),
      endDate: formatDate(selectedDate),
      search: searchQuery,
      page: currentPage - 1, // Backend uses 0-indexed pages
      limit: limit,
    }),
    enabled: !!selectedRestaurant?.id || !!currentUser?.id,
  });

  const bookings = data?.bookings || [];
  const totalCount = data?.bookingsCount || 0;
  const totalPages = data?.pageCount || 1;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return theme.palette.success.main;
      case 'seated':
        return theme.palette.info.main;
      case 'completed':
        return theme.palette.success.dark;
      case 'cancelled_by_user':
      case 'cancelled_by_restaurant':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>
          {selectedRestaurant?.name || 'Select a restaurant'}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date);
            setCurrentPage(1); // Reset to first page on date change
          }}
          format="day"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, phone..."
          placeholderTextColor={theme.palette.text.hint}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </View>

      {!selectedRestaurant?.id ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Please select a restaurant from Settings</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Error loading bookings</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search' : 'No bookings for this date'}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content}>
            {bookings.map((booking) => (
              <TouchableOpacity key={booking.id} style={styles.bookingCard}>
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
            ))}
          </ScrollView>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
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
  filtersContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.palette.background.paper,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.hint,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.error.main,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.md,
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
  contactInfo: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
  contactText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  notes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
  },
});
