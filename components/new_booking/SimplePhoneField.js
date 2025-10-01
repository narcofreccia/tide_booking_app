import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { useTheme } from '../../theme';

export const SimplePhoneField = ({ name = 'phone', label = 'Phone' }) => {
  const { control } = useFormContext();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="+39 123 456 7890"
              placeholderTextColor={theme.palette.text.hint}
              keyboardType="phone-pad"
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
