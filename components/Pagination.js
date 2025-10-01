import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

/**
 * Pagination Component
 * Reusable pagination controls for paginated data
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback when page changes
 * @param {number} totalItems - Total number of items (optional, for display)
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
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

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.arrowButton, currentPage === 1 && styles.arrowButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentPage === 1}
        >
          <Text style={[styles.arrowText, currentPage === 1 && styles.arrowTextDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </Text>
          {totalItems !== undefined && (
            <Text style={styles.itemsText}>
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.arrowButton, currentPage === totalPages && styles.arrowButtonDisabled]}
          onPress={handleNext}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.arrowText, currentPage === totalPages && styles.arrowTextDisabled]}>
            ›
          </Text>
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
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 20,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  arrowTextDisabled: {
    color: theme.palette.text.disabled,
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
