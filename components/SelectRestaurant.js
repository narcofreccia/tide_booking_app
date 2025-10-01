import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantsNames } from '../services/api';

export const SelectRestaurant = () => {
  const theme = useTheme();
  const { selectedRestaurant, currentUser } = useStateContext();
  const dispatch = useDispatchContext();
  const styles = createStyles(theme);
  const [isOpen, setIsOpen] = React.useState(false);
  const userClearedRef = useRef(false);

  // Fetch restaurants
  const { data: restaurantsResponse, isLoading } = useQuery({
    queryKey: ['restaurant-names', currentUser?.business_id],
    queryFn: () => getRestaurantsNames(currentUser?.business_id, ''),
    enabled: !!currentUser,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60,
  });

  const options = restaurantsResponse?.restaurants || [];

  // Auto-select restaurant on initial load
  useEffect(() => {
    if (selectedRestaurant?.id) return; // Already selected
    if (userClearedRef.current && options.length > 1) return; // User cleared, don't auto-select
    if (options.length === 0) return; // No options available

    // Try to match by public_key if available
    if (currentUser?.public_key) {
      const match = options.find((o) => o.public_key === currentUser.public_key);
      if (match) {
        dispatch({ 
          type: 'UPDATE_SELECTED_RESTAURANT', 
          payload: { id: match.id, name: match.name, public_key: match.public_key } 
        });
        return;
      }
    }

    // Otherwise select first option
    if (options.length > 0) {
      const first = options[0];
      dispatch({ 
        type: 'UPDATE_SELECTED_RESTAURANT', 
        payload: { id: first.id, name: first.name, public_key: first.public_key } 
      });
    }
  }, [options, selectedRestaurant?.id, currentUser?.public_key]);

  const handleSelect = (restaurant) => {
    if (restaurant) {
      dispatch({ 
        type: 'UPDATE_SELECTED_RESTAURANT', 
        payload: { id: restaurant.id, name: restaurant.name, public_key: restaurant.public_key } 
      });
    } else {
      userClearedRef.current = true;
      dispatch({ type: 'RESET_SELECTED_RESTAURANT' });
    }
    setIsOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.palette.primary.main} />
        </View>
      </View>
    );
  }

  // If only one restaurant, render static display
  if (options.length === 1) {
    const singleOption = options[0];
    return (
      <View style={styles.container}>
        <View style={styles.staticDisplay}>
          <Text style={styles.staticText}>{singleOption.name}</Text>
        </View>
      </View>
    );
  }

  // No restaurants available
  if (options.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.staticDisplay}>
          <Text style={[styles.staticText, { color: theme.palette.text.secondary }]}>
            No restaurants available
          </Text>
        </View>
      </View>
    );
  }

  // Multiple restaurants - render dropdown
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selector} onPress={() => setIsOpen(true)}>
        <Text style={styles.selectorText}>
          {selectedRestaurant?.name || 'Select restaurant'}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Restaurant</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[
                    styles.option,
                    selectedRestaurant?.id === restaurant.id && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(restaurant)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedRestaurant?.id === restaurant.id && styles.optionTextSelected,
                    ]}
                  >
                    {restaurant.name}
                  </Text>
                  {selectedRestaurant?.id === restaurant.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    minWidth: 240,
  },
  loadingContainer: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  staticDisplay: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.divider,
  },
  staticText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  selectorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  chevron: {
    fontSize: 10,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...theme.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  closeButton: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.palette.text.secondary,
    padding: theme.spacing.xs,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  optionSelected: {
    backgroundColor: theme.palette.primary.main + '20', // 20% opacity
  },
  optionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  checkmark: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
