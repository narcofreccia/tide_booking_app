import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { useTheme } from '../theme';

export const SimpleField = ({ 
  field, 
  label, 
  type = 'text', 
  isRequired = false, 
  disabled = false, 
  placeholder,
  multiline = false,
  rows = 1
}) => {
  const { control } = useFormContext();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        name={field}
        control={control}
        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[
                styles.input,
                multiline && styles.multilineInput,
                error && styles.inputError,
                disabled && styles.inputDisabled
              ]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={theme.palette.text.hint}
              editable={!disabled}
              keyboardType={type === 'email' ? 'email-address' : 'default'}
              autoCapitalize={type === 'email' ? 'none' : 'sentences'}
              multiline={multiline}
              numberOfLines={multiline ? rows : 1}
              textAlignVertical={multiline ? 'top' : 'center'}
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
  multilineInput: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.palette.error.main,
  },
  inputDisabled: {
    backgroundColor: theme.palette.background.default,
    opacity: 0.6,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
