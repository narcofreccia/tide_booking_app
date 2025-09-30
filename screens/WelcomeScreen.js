import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useStoredUser, useLogout } from '../hooks/useAuth';

export default function WelcomeScreen() {
  const { data: userData, isLoading } = useStoredUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                console.log('Logout successful');
              },
              onError: (error) => {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logo/tide_teal.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {userData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{userData.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={[styles.value, styles.roleBadge]}>{userData.role}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{userData.id}</Text>
          </View>

          {userData.business_id && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Business ID:</Text>
              <Text style={styles.value}>{userData.business_id}</Text>
            </View>
          )}

          {userData.features && userData.features.length > 0 && (
            <View style={styles.featuresContainer}>
              <Text style={styles.label}>Features:</Text>
              <View style={styles.featuresList}>
                {userData.features.map((feature, index) => (
                  <View key={index} style={styles.featureBadge}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={logoutMutation.isPending}
      >
        <Text style={styles.logoutButtonText}>
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🍽️ Tide Booking App</Text>
        <Text style={styles.footerSubtext}>Next: Restaurant Selection</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  roleBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '600',
  },
  featuresContainer: {
    paddingTop: 12,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  featureBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
  },
});
