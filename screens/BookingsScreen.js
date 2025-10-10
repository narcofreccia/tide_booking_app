import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useQuery } from '@tanstack/react-query';
import { getBookingsByDate, getAllTablesByRestaurantId } from '../services/api';
import { getLocale } from '../utils/localeUtils';
import { DateSelector } from '../components/DateSelector';
import { IntervalSelector } from '../components/booking_manager/IntervalSelector';
import { Pagination } from '../components/Pagination';
import { TideLogo } from '../components/TideLogo';
import { BookingRow } from '../components/bookings/BookingRow';
import { BookingSummaryBar } from '../components/booking_manager/BookingSummaryBar';
import CustomersScreen from './CustomersScreen';
import { VoiceRecorder } from '../components/recorder/VoiceRecorder';
import { getIcon, getIconSize } from '../config/icons';
import { useTranslation } from '../hooks/useTranslation';

export default function BookingsScreen() {
  const theme = useTheme();
  const { selectedRestaurant, currentUser, selectedBookingDate, language } = useStateContext();
  const dispatch = useDispatchContext();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const [selectedDate, setSelectedDate] = useState(selectedBookingDate || new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState(null);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceLocale, setVoiceLocale] = useState(null);
  const limit = 20;
  
  // Load voice recording locale from AsyncStorage or use app language
  useEffect(() => {
    const loadVoiceLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('@voice_recording_locale');
        setVoiceLocale(savedLocale || getLocale(language));
      } catch (error) {
        console.error('Failed to load voice locale:', error);
        setVoiceLocale(getLocale(language));
      }
    };
    loadVoiceLocale();
  }, [language]);

  // Format date to YYYY-MM-DD in local timezone
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // Fetch all tables for the restaurant to map table IDs to numbers
  const { data: tables = [] } = useQuery({
    queryKey: ['tables-by-restaurant', restaurantId, dateStr],
    queryFn: () => getAllTablesByRestaurantId(restaurantId, {
      date: dateStr,
      start_time: selectedInterval?.start_time,
      end_time: selectedInterval?.end_time,
    }),
    enabled: !!restaurantId && !!dateStr,
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

  // If showing voice recorder, render VoiceRecorder instead
  if (showVoiceRecorder) {
    return (
      <View style={[styles.voiceRecorderContainer, { backgroundColor: theme.palette.background.default }]}>
        <View style={[styles.voiceRecorderHeader, { borderBottomColor: theme.palette.divider }]}>
          <TouchableOpacity onPress={() => setShowVoiceRecorder(false)} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.palette.text.primary}
            />
            <Text style={[styles.backText, { color: theme.palette.text.primary }]}>
              Bookings
            </Text>
          </TouchableOpacity>
        </View>
        <VoiceRecorder
          locale={voiceLocale || 'en-US'}
          onTranscriptComplete={(result) => {
            console.log('Voice booking transcript:', result);
            // TODO: Process the transcript and create booking
            const transcriptText = result.transcript || 'No transcript';
            dispatch({
              type: 'UPDATE_ALERT',
              payload: {
                open: true,
                severity: 'info',
                message: `Transcript received: ${transcriptText}`,
              },
            });
          }}
          onError={(error) => {
            console.error('Voice recording error:', error);
            dispatch({
              type: 'UPDATE_ALERT',
              payload: {
                open: true,
                severity: 'error',
                message: 'Voice recording failed. Please try again.',
              },
            });
          }}
        />
      </View>
    );
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
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => setShowVoiceRecorder(true)}
            >
              <MaterialCommunityIcons
                name="microphone"
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
                tables={tables}
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
  voiceButton: {
    padding: theme.spacing.xs,
  },
  voiceRecorderContainer: {
    flex: 1,
  },
  voiceRecorderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
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
