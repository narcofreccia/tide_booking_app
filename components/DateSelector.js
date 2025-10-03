import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

/**
 * DateSelector Component
 * Allows navigation between dates with previous/next arrows
 * @param {Date} selectedDate - Currently selected date
 * @param {Function} onDateChange - Callback when date changes
 * @param {string} format - Date format ('full', 'short', 'day')
 */
export const DateSelector = ({ selectedDate, onDateChange, format = 'full' }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const formatDate = (date) => {
    const options = {
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      day: { weekday: 'short', month: 'short', day: 'numeric' },
    };

    return date.toLocaleDateString('en-US', options[format]);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.arrowButton} onPress={handlePrevious}>
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        {isToday(selectedDate) && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    minHeight: 56, // Standardized height
    ...theme.shadows.sm,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 28,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    textAlign: 'center',
  },
  todayBadge: {
    backgroundColor: theme.palette.primary.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  todayText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
