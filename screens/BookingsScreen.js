import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useQuery } from '@tanstack/react-query';
import { listBookings } from '../services/api';
import { DateSelector } from '../components/DateSelector';
import { Pagination } from '../components/Pagination';
import { TideLogo } from '../components/TideLogo';
import { BookingRow } from '../components/bookings/BookingRow';
import { getIcon, getIconSize } from '../config/icons';

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
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
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
    <GestureHandlerRootView style={styles.gestureContainer}>
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
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons
            name={getIcon('search')}
            size={getIconSize('md')}
            color={theme.palette.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, phone..."
            placeholderTextColor={theme.palette.text.disabled}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}>
              <MaterialCommunityIcons
                name={getIcon('close')}
                size={getIconSize('md')}
                color={theme.palette.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
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
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={theme.palette.primary.main}
                colors={[theme.palette.primary.main]}
              />
            }
          >
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
  outerContainer: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    paddingVertical: theme.spacing.sm,
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
    paddingHorizontal: theme.spacing.xs
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.sm,
  },
});
