import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../theme';

export default function CustomersScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock customers data
  const mockCustomers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900', totalBookings: 12 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 234 567 8901', totalBookings: 8 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 8902', totalBookings: 15 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 234 567 8903', totalBookings: 6 },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', phone: '+1 234 567 8904', totalBookings: 20 },
  ];

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>Manage your customer database</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor={theme.palette.text.hint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredCustomers.map((customer) => (
          <TouchableOpacity key={customer.id} style={styles.customerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.charAt(0)}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerEmail}>{customer.email}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
            </View>
            <View style={styles.bookingBadge}>
              <Text style={styles.bookingCount}>{customer.totalBookings}</Text>
              <Text style={styles.bookingLabel}>bookings</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
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
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
  },
  searchInput: {
    backgroundColor: theme.palette.background.default,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.primary.contrastText,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  customerEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  bookingBadge: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  bookingCount: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.primary.main,
  },
  bookingLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
  },
});
