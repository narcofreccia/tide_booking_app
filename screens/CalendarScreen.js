import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { TideLogo } from '../components/TideLogo';

export default function CalendarScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock calendar data
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const mockEvents = {
    5: 8,
    6: 12,
    7: 6,
    8: 15,
    9: 10,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>October 2025</Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
          
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                day === 1 && { marginLeft: '14.28%' }, // Start on Tuesday
              ]}
              onPress={() => setSelectedDate(new Date(2025, 9, day))}
            >
              <Text style={styles.dayNumber}>{day}</Text>
              {mockEvents[day] && (
                <View style={styles.eventIndicator}>
                  <Text style={styles.eventCount}>{mockEvents[day]}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Bookings Summary</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.palette.primary.main }]} />
            <Text style={styles.legendText}>Total bookings this month: 51</Text>
          </View>
        </View>
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
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  dayHeader: {
    width: '14.28%',
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.secondary,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  eventCount: {
    fontSize: 8,
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeight.bold,
  },
  legend: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  legendTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  legendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
});
