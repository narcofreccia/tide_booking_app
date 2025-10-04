import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '../theme';
import { useTranslation } from '../hooks/useTranslation';

/**
 * ThemeToggle Component
 * Toggle between light and dark theme modes
 */
export const ThemeToggle = () => {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeMode();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const isDark = themeMode === 'dark';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={isDark ? 'weather-night' : 'weather-sunny'}
            size={24}
            color={theme.palette.text.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{t('settings.theme')}</Text>
          <Text style={styles.value}>
            {isDark ? t('settings.darkMode') : t('settings.lightMode')}
          </Text>
        </View>
      </View>
      <View style={styles.toggle}>
        <View style={[styles.track, isDark && styles.trackActive]}>
          <View style={[styles.thumb, isDark && styles.thumbActive]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,

  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.palette.text.primary,
    marginBottom: 2,
  },
  value: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  toggle: {
    marginLeft: theme.spacing.md,
  },
  track: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.palette.divider,
    justifyContent: 'center',
    padding: 2,
  },
  trackActive: {
    backgroundColor: theme.palette.primary.main,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    transform: [{ translateX: 22 }],
  },
});
