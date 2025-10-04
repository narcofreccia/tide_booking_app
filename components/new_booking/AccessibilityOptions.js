import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getIcon, getIconSize } from '../../config/icons';
import { useTranslation } from '../../hooks/useTranslation';

export const AccessibilityOptions = ({ collapsed = true, disableCollapse = false }) => {
  const { control } = useFormContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const NumberInput = ({ name, label, iconKey }) => (
    <View style={styles.numberInputContainer}>
      <View style={styles.numberInputLabel}>
        <MaterialCommunityIcons name={getIcon(iconKey)} size={getIconSize('lg')} color={theme.palette.text.primary} />
        <Text style={styles.numberInputText}>{label}</Text>
      </View>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => {
          const numValue = value ?? 0;
          return (
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => onChange(Math.max(0, numValue - 1))}
              >
                <MaterialCommunityIcons name="minus" size={20} color={theme.palette.text.primary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{numValue}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => onChange(numValue + 1)}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.palette.text.primary} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {!disableCollapse && (
        <TouchableOpacity
          style={styles.header}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.headerText}>{t('bookings.accessibilityOptions')}</Text>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.palette.text.secondary}
          />
        </TouchableOpacity>
      )}

      {(isExpanded || disableCollapse) && (
        <View style={styles.content}>
          <NumberInput name="highchair_number" label={t('bookings.highchairs')} iconKey="highchair" />
          <NumberInput name="wheelchair_number" label={t('bookings.wheelchairs')} iconKey="wheelchair" />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  headerText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.secondary,
  },
  content: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  numberInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  numberInputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  numberInputText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
  },
  counterContainer: {
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
  counterValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
});
