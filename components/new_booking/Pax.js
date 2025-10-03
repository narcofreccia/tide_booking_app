import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getIcon, getIconSize } from '../../config/icons';

export const Pax = () => {
  const { control } = useFormContext();
  const theme = useTheme();
  const styles = createStyles(theme);

  const GuestCounter = ({ name, label, iconKey, min = 0 }) => (
    <View style={styles.counterContainer}>
      <View style={styles.counterLabel}>
        <MaterialCommunityIcons name={getIcon(iconKey)} size={getIconSize('lg')} color={theme.palette.text.primary} />
        <Text style={styles.counterText}>{label}</Text>
      </View>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          const numValue = value ?? (name === 'adults' ? 2 : 0);
          return (
            <View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.counterButton, numValue <= min && styles.counterButtonDisabled]}
                  onPress={() => onChange(Math.max(min, numValue - 1))}
                  disabled={numValue <= min}
                >
                  <MaterialCommunityIcons 
                    name="minus" 
                    size={20} 
                    color={numValue <= min ? theme.palette.text.disabled : theme.palette.text.primary} 
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{numValue}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => onChange(numValue + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={theme.palette.text.primary} />
                </TouchableOpacity>
              </View>
              {error && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <GuestCounter name="adults" label="Adults" iconKey="user" min={1} />
      <GuestCounter name="children" label="Children" iconKey="guests" min={0} />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  counterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  counterText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.3,
  },
  counterValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
