import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useLogout } from '../hooks/useAuth';
import { SelectRestaurant } from '../components/SelectRestaurant';
import { TideLogo } from '../components/TideLogo';
import { getIcon, getIconSize } from '../config/icons';
import CustomersScreen from './CustomersScreen';

export default function SettingsScreen() {
  const theme = useTheme();
  const { currentUser } = useStateContext();
  const dispatch = useDispatchContext();
  const logoutMutation = useLogout();
  const [showCustomers, setShowCustomers] = useState(false);
  const styles = createStyles(theme);

  const handleLogout = () => {
    dispatch({
      type: 'OPEN_DIALOG',
      payload: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        onSubmit: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: () => {
              dispatch({
                type: 'UPDATE_ALERT',
                payload: {
                  open: true,
                  severity: 'success',
                  message: 'Logged out successfully',
                },
              });
            },
            onError: (error) => {
              dispatch({
                type: 'UPDATE_ALERT',
                payload: {
                  open: true,
                  severity: 'error',
                  message: 'Failed to logout. Please try again.',
                },
              });
            },
          });
        },
      },
    });
  };

  const SettingItem = ({ iconKey, title, subtitle, onPress, danger }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons 
          name={getIcon(iconKey)} 
          size={getIconSize('lg')} 
          color={danger ? theme.palette.error.main : theme.palette.text.secondary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: theme.palette.error.main }]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  // If showing customers, render CustomersScreen instead
  if (showCustomers) {
    return <CustomersScreen onBack={() => setShowCustomers(false)} />;
  }

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your account and preferences</Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Restaurant Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <SelectRestaurant />
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email || 'user@example.com'}</Text>
              <View style={styles.profileDetails}>
                <Text style={styles.profileRole}>
                  {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Manager'}
                </Text>
                {currentUser?.business_id && (
                  <Text style={styles.profileBusiness}>
                    • Business ID: {currentUser.business_id}
                  </Text>
                )}
              </View>
              {currentUser?.features && currentUser.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {currentUser.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                  {currentUser.features.length > 3 && (
                    <Text style={styles.moreFeatures}>
                      +{currentUser.features.length - 3} more
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingItem
            iconKey="shop"
            title="Restaurant Details"
            subtitle="Manage restaurant information"
          />
          <SettingItem
            iconKey="customers"
            title="Customers"
            subtitle="View and manage customer database"
            onPress={() => setShowCustomers(true)}
          />
          <SettingItem
            iconKey="clock"
            title="Operating Hours"
            subtitle="Set opening and closing times"
          />
          <SettingItem
            iconKey="table"
            title="Table Management"
            subtitle="Configure tables and seating"
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            iconKey="notification"
            title="Push Notifications"
            subtitle="Manage notification preferences"
          />
          <SettingItem
            iconKey="email"
            title="Email Notifications"
            subtitle="Configure email alerts"
          />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            iconKey="lock"
            title="Change Password"
            subtitle="Update your password"
          />
          <SettingItem
            iconKey="team"
            title="Team Members"
            subtitle="Manage staff access"
          />
          <SettingItem
            iconKey="billing"
            title="Billing"
            subtitle="Subscription and payment"
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            iconKey="help"
            title="Help & Support"
            subtitle="Get help with the app"
          />
          <SettingItem
            iconKey="document"
            title="Terms & Privacy"
            subtitle="Legal information"
          />
          <SettingItem
            iconKey="version"
            title="App Version"
            subtitle="1.0.0"
          />
        </View>

        {/* Logout */}
        <SettingItem
          iconKey="logout"
          title="Logout"
          subtitle="Logout from the app"
          onPress={handleLogout}
          danger
        />
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileAvatarText: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.primary.contrastText,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xs,
  },
  profileRole: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.medium,
  },
  profileBusiness: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
    alignItems: 'center',
  },
  featureBadge: {
    backgroundColor: theme.palette.primary.main + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.medium,
  },
  moreFeatures: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.palette.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
  },
  chevron: {
    fontSize: theme.typography.fontSize.xxl,
    color: theme.palette.text.disabled,
  },
  logoutButton: {
    backgroundColor: theme.palette.error.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  logoutButtonText: {
    color: theme.palette.error.contrastText,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
