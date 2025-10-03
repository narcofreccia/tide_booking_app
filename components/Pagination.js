import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { getIcon, getIconSize } from '../config/icons';

/**
 * Pagination Component
 * Reusable pagination controls for paginated data
 * @param {number} currentPage - Current page number (0-indexed or 1-indexed based on zeroIndexed prop)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback when page changes
 * @param {number} totalItems - Total number of items (optional, for display)
 * @param {boolean} zeroIndexed - If true, currentPage is 0-indexed (default: false)
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, zeroIndexed = false }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Convert to 1-indexed for display
  const displayPage = zeroIndexed ? currentPage + 1 : currentPage;

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  const handlePrevious = () => {
    const minPage = zeroIndexed ? 0 : 1;
    if (currentPage > minPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    const maxPage = zeroIndexed ? totalPages - 1 : totalPages;
    if (currentPage < maxPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSelect = (page) => {
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const minPage = zeroIndexed ? 0 : 1;
  const maxPage = zeroIndexed ? totalPages - 1 : totalPages;
  const isFirstPage = currentPage === minPage;
  const isLastPage = currentPage === maxPage;

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.arrowButton, isFirstPage && styles.arrowButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstPage}
        >
          <MaterialCommunityIcons
            name={getIcon('chevronLeft')}
            size={getIconSize('lg')}
            color={isFirstPage ? theme.palette.text.disabled : theme.palette.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={styles.pageInfo}>
            Page {displayPage} of {totalPages}
          </Text>
          {totalItems !== undefined && (
            <Text style={styles.itemsText}>
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.arrowButton, isLastPage && styles.arrowButtonDisabled]}
          onPress={handleNext}
          disabled={isLastPage}
        >
          <MaterialCommunityIcons
            name={getIcon('chevronRight')}
            size={getIconSize('lg')}
            color={isLastPage ? theme.palette.text.disabled : theme.palette.text.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.palette.divider,
    ...theme.shadows.sm,
  },
  arrowButtonDisabled: {
    opacity: 0.4,
    backgroundColor: theme.palette.background.elevated,
  },
  centerInfo: {
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  itemsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
});
