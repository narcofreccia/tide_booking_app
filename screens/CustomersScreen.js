import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStateContext } from '../context/ContextProvider';
import { getBookingCustomers } from '../services/api';
import { TideLogo } from '../components/TideLogo';
import { Pagination } from '../components/Pagination';
import { OrderingList } from '../components/OrderingList';
import { CustomerRow } from '../components/customers/CustomerRow';
import { getIcon, getIconSize } from '../config/icons';

const CUSTOMER_ORDER_OPTIONS = [
  { value: 'total_bookings', label: 'Total Bookings' },
  { value: 'last_booking_date', label: 'Last Booking' },
  { value: 'no_show_count', label: 'No Shows' },
  { value: 'cancelled_by_user_count', label: 'Cancellations' },
];

export default function CustomersScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { selectedRestaurant, currentUser } = useStateContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [orderByColumn, setOrderByColumn] = useState('total_bookings');
  const [orderByType, setOrderByType] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 20;

  const restaurantId = selectedRestaurant?.id || currentUser?.restaurant_id;

  // Fetch customers data
  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-customers', restaurantId, searchQuery, orderByColumn, orderByType, currentPage],
    queryFn: () => getBookingCustomers({
      restaurant_id: restaurantId,
      search: searchQuery || undefined,
      orderByColumn,
      orderByType,
      limit,
      page: currentPage,
    }),
    enabled: !!restaurantId,
    staleTime: 30000, // 30 seconds
  });

  const customers = data?.customers || [];
  const totalCount = data?.customersCount || 0;
  const totalPages = data?.pageCount || 1;

  const handleOrderChange = (column, type) => {
    setOrderByColumn(column);
    setOrderByType(type);
    setCurrentPage(0); // Reset to first page when ordering changes
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleCustomerPress = (customer) => {
    // TODO: Navigate to customer details or show modal
    console.log('Customer pressed:', customer);
  };
  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Customers</Text>
            <Text style={styles.subtitle}>
              {selectedRestaurant?.name || 'Select a restaurant'}
            </Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name={getIcon('search')}
          size={getIconSize('md')}
          color={theme.palette.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          placeholderTextColor={theme.palette.text.disabled}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <MaterialCommunityIcons
              name={getIcon('close')}
              size={getIconSize('md')}
              color={theme.palette.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {!restaurantId ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Select a restaurant to view customers
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>Failed to load customers</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Ordering */}
          <OrderingList
            options={CUSTOMER_ORDER_OPTIONS}
            orderByColumn={orderByColumn}
            orderByType={orderByType}
            onOrderChange={handleOrderChange}
          />

          {/* Customer List */}
          {customers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </Text>
            </View>
          ) : (
            <>
              {customers.map((customer) => (
                <CustomerRow
                  key={customer.phone}
                  customer={customer}
                  onPress={() => handleCustomerPress(customer)}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  onPageChange={setCurrentPage}
                  zeroIndexed={true}
                />
              )}
            </>
          )}
        </ScrollView>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
    gap: theme.spacing.sm,
  },
  searchIcon: {
    marginLeft: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    paddingVertical: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.error.main,
    textAlign: 'center',
  },
});
