import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../theme';
import { useStateContext } from '../context/ContextProvider';
import { getMonthlyBookings } from '../services/api';
import { TideLogo } from '../components/TideLogo';
import { MonthSelector } from '../components/calendar/MonthSelector';
import { DayCard } from '../components/calendar/DayCard';
import { DayDetailsModal } from '../components/calendar/DayDetailsModal';

export default function CalendarScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { selectedRestaurant, currentUser } = useStateContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const restaurantId = selectedRestaurant?.id || currentUser?.restaurant_id;
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Fetch monthly bookings data
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['monthly-bookings', restaurantId, selectedYear, selectedMonth],
    queryFn: () => getMonthlyBookings(restaurantId, selectedYear, selectedMonth),
    enabled: !!restaurantId,
    staleTime: 60000, // 1 minute
  });

  const dailySummaries = data?.daily_summaries || [];

  // Get booking summary for a specific day
  const getDaySummary = (day) => {
    return dailySummaries.find(summary => summary.day === day) || null;
  };

  // Get current month days with proper grid layout
  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Convert to Monday-based

    const days = [];

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: null, date: null });
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const today = new Date();
      const isToday = 
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      days.push({
        day: i,
        date: currentDate,
        isToday,
      });
    }

    return days;
  }, [selectedDate]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    return result;
  }, [monthDays]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDayPress = (dayObj) => {
    setSelectedDay(dayObj);
    setModalVisible(true);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>
              {selectedRestaurant?.name || 'Select a restaurant'}
            </Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelectorContainer}>
        <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </View>

      {!restaurantId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Select a restaurant to view monthly bookings
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      ) : (
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
          {/* Day names header */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((day) => (
              <View key={day} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((dayObj, dayIndex) => (
                <View key={dayIndex} style={styles.dayCell}>
                  <DayCard
                    day={dayObj.day}
                    isToday={dayObj.isToday}
                    daySummary={getDaySummary(dayObj.day)}
                    onPress={() => handleDayPress(dayObj)}
                  />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Day Details Modal */}
      <DayDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        day={selectedDay?.day}
        date={selectedDay?.date}
        daySummary={getDaySummary(selectedDay?.day)}
      />
    </>
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
  header: {
    padding: theme.spacing.lg,
    backgroundColor: 'transparent'
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
  content: {
    flex: 1,
    //paddingHorizontal: theme.spacing.xs,
  },
  monthSelectorContainer: {
    padding: theme.spacing.lg,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  dayCell: {
    width: `${100 / 7}%`,
    paddingHorizontal: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
});
