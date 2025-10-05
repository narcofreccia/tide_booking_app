import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getIcon, getIconSize } from '../../config/icons';

/**
 * PasswordField Component
 * Reusable password input field with show/hide toggle
 */
export const PasswordField = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  error,
  ...props 
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <MaterialCommunityIcons
          name={getIcon('lock')}
          size={getIconSize('md')}
          color={theme.palette.text.secondary}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.palette.text.disabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.toggleButton}
        >
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={getIconSize('md')}
            color={theme.palette.text.secondary}
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.palette.border,
    paddingHorizontal: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.palette.error.main,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    paddingVertical: theme.spacing.md,
  },
  toggleButton: {
    padding: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.error.main,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
