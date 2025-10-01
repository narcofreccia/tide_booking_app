import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { DateSelector } from '../DateSelector';

export const NewBookingDatePicker = ({ name = 'reservation_date', label = 'Date' }) => {
  const { control, setValue } = useFormContext();
  const theme = useTheme();
  const styles = createStyles(theme);

  // Set default to today
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setValue(name, today, { shouldValidate: true, shouldDirty: false });
  }, [name, setValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        name={name}
        control={control}
        defaultValue={new Date()}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <>
            <DateSelector
              selectedDate={value || new Date()}
              onDateChange={onChange}
              format="day"
            />
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </>
        )}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
