import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useQuery } from '@tanstack/react-query';
import { getBookingsByDate } from '../services/api';
import { DateSelector } from '../components/DateSelector';
import { IntervalSelector } from '../components/booking_manager/IntervalSelector';
import { Pagination } from '../components/Pagination';
import { TideLogo } from '../components/TideLogo';
import { BookingRow } from '../components/bookings/BookingRow';
import { BookingSummaryBar } from '../components/booking_manager/BookingSummaryBar';
import CustomersScreen from './CustomersScreen';
import { getIcon, getIconSize } from '../config/icons';
import { useTranslation } from '../hooks/useTranslation';

export default function BookingsScreen() {
  const theme = useTheme();
  const { selectedRestaurant, currentUser, selectedBookingDate } = useStateContext();
  const dispatch = useDispatchContext();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const [selectedDate, setSelectedDate] = useState(selectedBookingDate || new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState(null);
  const [showCustomers, setShowCustomers] = useState(false);
  const limit = 20;

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  const restaurantId = selectedRestaurant?.id || currentUser?.restaurant_id;
  const dateStr = formatDate(selectedDate);

  // Fetch bookings with section and interval filters
  const { data: bookings = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['bookings', restaurantId, dateStr, selectedInterval?.start_time, selectedInterval?.end_time, searchQuery],
    queryFn: () => getBookingsByDate(restaurantId, {
      reservation_date: dateStr,
      start_time: selectedInterval?.start_time,
      end_time: selectedInterval?.end_time,
    }),
    enabled: !!restaurantId,
  });

  // Filter bookings by search query (client-side)
  const filteredBookings = searchQuery
    ? bookings.filter(booking => {
        const searchLower = searchQuery.toLowerCase();
        return (
          booking.name?.toLowerCase().includes(searchLower) ||
          booking.surname?.toLowerCase().includes(searchLower) ||
          booking.phone?.toLowerCase().includes(searchLower) ||
          booking.email?.toLowerCase().includes(searchLower)
        );
      })
    : bookings;

  // Pagination (client-side)
  const totalCount = filteredBookings.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handleBookingPress = (booking) => {
    // TODO: Navigate to booking details or open edit modal
    console.log('Booking pressed:', booking);
  };

  const handleIntervalChange = (interval, index) => {
    setSelectedInterval(interval);
    setSelectedIntervalIndex(index);
    setCurrentPage(1); // Reset to first page on interval change
  };

  // If showing customers, render CustomersScreen instead
  if (showCustomers) {
    return <CustomersScreen onBack={() => setShowCustomers(false)} />;
  }

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{t('bookings.title')}</Text>
            <Text style={styles.subtitle}>
              {selectedRestaurant?.name || t('bookings.selectRestaurantPrompt')}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.customersButton}
              onPress={() => setShowCustomers(true)}
            >
              <MaterialCommunityIcons
                name={getIcon('customers')}
                size={getIconSize('lg')}
                color={theme.palette.primary.main}
              />
            </TouchableOpacity>
            <TideLogo size={32} />
          </View>
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

      {/* Interval Selector */}
      {restaurantId && (
        <View style={styles.selectorsContainer}>
          <IntervalSelector
            restaurantId={restaurantId}
            date={dateStr}
            selectedIntervalIndex={selectedIntervalIndex}
            onIntervalChange={handleIntervalChange}
          />
        </View>
      )}

      {/* Search Bar and Summary */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons
              name={getIcon('search')}
              size={getIconSize('md')}
              color={theme.palette.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('bookings.searchPlaceholder')}
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
          {restaurantId && !searchQuery && (
            <BookingSummaryBar
              restaurantId={restaurantId}
              date={dateStr}
              interval={selectedInterval}
            />
          )}
        </View>
      </View>

      {!restaurantId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('bookings.pleaseSelectRestaurant')}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text style={styles.loadingText}>{t('bookings.loadingBookings')}</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('bookings.errorLoading')}</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('bookings.noBookingsFound')}</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? t('bookings.tryDifferentSearch') : t('bookings.noBookingsForDate')}
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
            {paginatedBookings.map((booking) => (
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  customersButton: {
    padding: theme.spacing.xs,
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
  selectorsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
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
