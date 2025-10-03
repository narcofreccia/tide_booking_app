import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthSelector = ({ selectedDate, onDateChange }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const monthName = MONTHS[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePrevMonth}>
        <MaterialCommunityIcons name="chevron-left" size={24} color={theme.palette.text.primary} />
      </TouchableOpacity>

      <View style={styles.dateDisplay}>
        <Text style={styles.monthText}>{monthName}</Text>
        <Text style={styles.yearText}>{year}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNextMonth}>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.palette.text.primary} />
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
    minHeight: 56, // Match DateSelector height
    ...theme.shadows.sm,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  monthText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  yearText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
});
