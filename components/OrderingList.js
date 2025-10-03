import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { getIcon, getIconSize } from '../config/icons';

/**
 * Reusable ordering/sorting component
 * @param {Array} options - Array of sort options [{value: 'column_name', label: 'Display Name'}]
 * @param {string} orderByColumn - Currently selected column
 * @param {string} orderByType - Order type ('asc' or 'desc')
 * @param {function} onOrderChange - Callback when order changes (column, type)
 * @param {string} label - Optional label text (default: 'Sort by:')
 * @param {string} defaultOrderType - Default order type for new columns (default: 'desc')
 */
export const OrderingList = ({ 
  options, 
  orderByColumn, 
  orderByType, 
  onOrderChange,
  label = 'Sort by:',
  defaultOrderType = 'desc'
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const handlePress = (value) => {
    if (orderByColumn === value) {
      // Toggle order type if same column
      onOrderChange(value, orderByType === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, use default order type
      onOrderChange(value, defaultOrderType);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isActive = orderByColumn === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => handlePress(option.value)}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {option.label}
              </Text>
              {isActive && (
                <MaterialCommunityIcons
                  name={orderByType === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={getIconSize('sm')}
                  color={theme.palette.primary.contrastText}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.divider,
  },
  optionActive: {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
  optionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
  },
  optionTextActive: {
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
