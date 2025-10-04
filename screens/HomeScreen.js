import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { getIcon, getIconSize } from '../config/icons';
import { useTranslation } from '../hooks/useTranslation';
import BookingsScreen from './BookingsScreen';
import BookingsMapScreen from './BookingsMapScreen';
import CreateBookingScreen from './CreateBookingScreen';
import CalendarScreen from './CalendarScreen';
import SettingsScreen from './SettingsScreen';

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('bookings');
  const styles = createStyles(theme);

  const handleCreateBookingSuccess = () => {
    // Switch to bookings tab after successful booking creation
    setActiveTab('bookings');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <BookingsScreen />;
      case 'map':
        return <BookingsMapScreen />;
      case 'create':
        return <CreateBookingScreen onSuccess={handleCreateBookingSuccess} />;
      case 'calendar':
        return <CalendarScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <BookingsScreen />;
    }
  };

  const TabButton = ({ id, iconKey, label, isCenter }) => {
    const isActive = activeTab === id;
    
    if (isCenter) {
      return (
        <TouchableOpacity
          style={styles.centerTabButton}
          onPress={() => setActiveTab(id)}
        >
          <View style={styles.centerTabIcon}>
            <MaterialCommunityIcons name={getIcon(iconKey)} size={getIconSize('xl')} color={theme.palette.primary.contrastText} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(id)}
      >
        <MaterialCommunityIcons 
          name={getIcon(iconKey)} 
          size={getIconSize('lg')} 
          color={isActive ? theme.palette.primary.main : theme.palette.text.secondary}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.bottomNav}>
        <TabButton id="bookings" iconKey="bookings" label={t('navigation.bookings')} />
        <TabButton id="map" iconKey="table" label={t('navigation.map')} />
        <TabButton id="create" iconKey="add" isCenter />
        <TabButton id="calendar" iconKey="calendar" label={t('navigation.calendar')} />
        <TabButton id="settings" iconKey="settings" label={t('navigation.settings')} />
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingBottom: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: 4,
  },
  tabLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tabLabelActive: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  centerTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerTabIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
});
