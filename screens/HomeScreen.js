import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { getIcon, getIconSize } from '../config/icons';
import BookingsScreen from './BookingsScreen';
import CalendarScreen from './CalendarScreen';
import CreateBookingScreen from './CreateBookingScreen';
import CustomersScreen from './CustomersScreen';
import SettingsScreen from './SettingsScreen';

export default function HomeScreen() {
  const theme = useTheme();
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
      case 'calendar':
        return <CalendarScreen />;
      case 'create':
        return <CreateBookingScreen onSuccess={handleCreateBookingSuccess} />;
      case 'customers':
        return <CustomersScreen />;
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {renderContent()}
        </View>

        <View style={styles.bottomNav}>
          <TabButton id="bookings" iconKey="bookings" label="Bookings" />
          <TabButton id="calendar" iconKey="calendar" label="Calendar" />
          <TabButton id="create" iconKey="add" isCenter />
          <TabButton id="customers" iconKey="customers" label="Customers" />
          <TabButton id="settings" iconKey="settings" label="Settings" />
        </View>
      </SafeAreaView>
    </View>
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
    backgroundColor: theme.palette.background.paper,
    borderTopWidth: 1,
    borderTopColor: theme.palette.divider,
    paddingBottom: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    ...theme.shadows.lg,
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
