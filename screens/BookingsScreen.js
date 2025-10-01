import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useQuery } from '@tanstack/react-query';
import { listBookings } from '../services/api';
import { DateSelector } from '../components/DateSelector';
import { Pagination } from '../components/Pagination';
import { TideLogo } from '../components/TideLogo';
import { BookingRow } from '../components/bookings/BookingRow';

export default function BookingsScreen() {
  const theme = useTheme();
  const { selectedRestaurant, currentUser, selectedBookingDate } = useStateContext();
  const dispatch = useDispatchContext();
  const styles = createStyles(theme);

  const [selectedDate, setSelectedDate] = useState(selectedBookingDate || new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  const restaurantId = selectedRestaurant?.id || currentUser?.restaurant_id;
  // Fetch bookings
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', restaurantId , formatDate(selectedDate), searchQuery, currentPage],
    queryFn: () => listBookings({
      restaurant_id: restaurantId,
      startDate: formatDate(selectedDate),
      endDate: formatDate(selectedDate),
      search: searchQuery,
      page: currentPage - 1, // Backend uses 0-indexed pages
      limit: limit,
    }),
    enabled: !!restaurantId,
  });

  const bookings = data?.bookings || [];
  const totalCount = data?.bookingsCount || 0;
  const totalPages = data?.pageCount || 1;

  const handleBookingPress = (booking) => {
    // TODO: Navigate to booking details or open edit modal
    console.log('Booking pressed:', booking);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Bookings</Text>
            <Text style={styles.subtitle}>
              {selectedRestaurant?.name || 'Select a restaurant'}
            </Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date);
            dispatch({ type: 'UPDATE_SELECTED_BOOKING_DATE', payload: date });
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

      {!restaurantId ? (
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
              <BookingRow 
                key={booking.id} 
                booking={booking} 
                onPress={handleBookingPress}
              />
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
    </GestureHandlerRootView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
