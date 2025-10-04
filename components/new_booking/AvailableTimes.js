import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { useStateContext } from '../../context/ContextProvider';
import { getAvailableTimes } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

export const AvailableTimes = ({ name = 'arrival_time', label = 'Time' }) => {
  const { control, watch, setValue } = useFormContext();
  const { selectedRestaurant } = useStateContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const reservationDate = watch('reservation_date');
  
  // Format date to YYYY-MM-DD (local timezone)
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDate = formatDate(reservationDate);

  // Fetch available times from API
  const { data, isLoading } = useQuery({
    queryKey: ['available-times', selectedRestaurant?.id, selectedDate],
    queryFn: () => getAvailableTimes(selectedRestaurant?.id, selectedDate, 'booking'),
    enabled: !!selectedRestaurant?.id && !!selectedDate,
    staleTime: 30000,
  });

  const times = data?.available_times || [];

  // Normalize time format to HH:mm for comparison
  const normalizeTime = (time) => {
    if (!time) return '';
    // If time is HH:mm:ss, convert to HH:mm
    if (time.length === 8) return time.substring(0, 5);
    return time;
  };

  // Ensure the form value is set when times load (for edit mode)
  useEffect(() => {
    const currentValue = watch(name);
    const normalizedValue = normalizeTime(currentValue);
    
    if (times.length > 0 && currentValue) {
      // Find matching time in available times
      const matchingTime = times.find(t => normalizeTime(t) === normalizedValue);
      
      if (matchingTime) {
        // Set the value to match the format from available times
        setValue(name, matchingTime, { shouldValidate: true, shouldDirty: false });
      } else {
        // Time not available, clear it after a delay
        const timer = setTimeout(() => {
          setValue(name, '', { shouldValidate: true });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [times, name, watch, setValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.palette.primary.main} />
                <Text style={styles.loadingText}>{t('bookings.loadingTimes')}</Text>
              </View>
            ) : times.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('bookings.noAvailableTimes')}</Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
              >
                {times.map((time) => {
                  const normalizedTime = normalizeTime(time);
                  const normalizedValue = normalizeTime(value);
                  const isSelected = normalizedTime === normalizedValue;
                  
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButton,
                        isSelected && styles.timeButtonActive
                      ]}
                      onPress={() => onChange(time)}
                    >
                      <Text style={[
                        styles.timeText,
                        isSelected && styles.timeTextActive
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
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
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: theme.spacing.sm,
  },
  timeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.paper,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  timeButtonActive: {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
  timeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timeTextActive: {
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  emptyContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
});
