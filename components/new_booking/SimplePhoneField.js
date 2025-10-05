import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { useTheme } from '../../theme';

export const SimplePhoneField = ({ name = 'phone', label = 'Phone', defaultCountryCode = '+39' }) => {
  const { control } = useFormContext();
  const theme = useTheme();
  const styles = createStyles(theme);

  const handlePhoneChange = (text, onChange) => {
    // Allow digits, +, and spaces only
    let cleaned = text.replace(/[^\d+\s]/g, '');
    
    // If empty or user deleted the +, reset to default country code
    if (cleaned.length === 0 || (!cleaned.startsWith('+') && cleaned.trim().length === 0)) {
      onChange(defaultCountryCode);
      return;
    }
    
    // If doesn't start with +, add default country code
    if (!cleaned.startsWith('+')) {
      cleaned = defaultCountryCode + ' ' + cleaned.trim();
    }
    
    // Ensure only one + at the start and it's at position 0
    if (cleaned.indexOf('+') > 0) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    
    onChange(cleaned);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => {
          const displayValue = value || defaultCountryCode;
          
          const handleBlur = () => {
            // If only country code or empty, clear the field
            if (!value || value === defaultCountryCode || value === '+' || value.trim() === '') {
              onChange(null);
            }
            onBlur();
          };
          
          return (
            <>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={displayValue}
                onChangeText={(text) => handlePhoneChange(text, onChange)}
                onBlur={handleBlur}
                placeholder="+39 123 456 7890"
                placeholderTextColor={theme.palette.text.hint}
                keyboardType="phone-pad"
                selectTextOnFocus={false}
              />
              {error && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </>
          );
        }}
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
  input: {
    backgroundColor: theme.palette.background.paper,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    minHeight: 48,
  },
  inputError: {
    borderColor: theme.palette.error.main,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
