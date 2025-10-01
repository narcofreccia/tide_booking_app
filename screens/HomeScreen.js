import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
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

  const TabButton = ({ id, iconName, label, isCenter }) => {
    const isActive = activeTab === id;
    
    if (isCenter) {
      return (
        <TouchableOpacity
          style={styles.centerTabButton}
          onPress={() => setActiveTab(id)}
        >
          <View style={styles.centerTabIcon}>
            <Ionicons name={iconName} size={28} color={theme.palette.primary.contrastText} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(id)}
      >
        <Ionicons 
          name={iconName} 
          size={24} 
          color={isActive ? theme.palette.primary.main : theme.palette.text.secondary}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.bottomNav}>
        <TabButton id="bookings" iconName="list" label="Bookings" />
        <TabButton id="calendar" iconName="calendar" label="Calendar" />
        <TabButton id="create" iconName="add" isCenter />
        <TabButton id="customers" iconName="people" label="Customers" />
        <TabButton id="settings" iconName="settings" label="Settings" />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
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
