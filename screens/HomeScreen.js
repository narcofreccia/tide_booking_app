import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
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

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <BookingsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'create':
        return <CreateBookingScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <BookingsScreen />;
    }
  };

  const TabButton = ({ id, icon, label, isCenter }) => {
    const isActive = activeTab === id;
    
    if (isCenter) {
      return (
        <TouchableOpacity
          style={styles.centerTabButton}
          onPress={() => setActiveTab(id)}
        >
          <View style={styles.centerTabIcon}>
            <Text style={styles.centerTabIconText}>{icon}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(id)}
      >
        <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
          {icon}
        </Text>
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
        <TabButton id="bookings" icon="📋" label="Bookings" />
        <TabButton id="calendar" icon="📅" label="Calendar" />
        <TabButton id="create" icon="+" isCenter />
        <TabButton id="customers" icon="👥" label="Customers" />
        <TabButton id="settings" icon="⚙️" label="Settings" />
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
    paddingVertical: theme.spacing.xs,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
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
  centerTabIconText: {
    fontSize: 32,
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
