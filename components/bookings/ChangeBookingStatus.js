import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useDispatchContext } from '../../context/ContextProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeBookingStatus } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

const DEFAULT_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'cancelled_by_user',
  'cancelled_by_restaurant',
  'no_show',
  'arrived',
  'seated',
  'bill',
  'clean',
  'completed',
];

export const ChangeBookingStatus = ({ booking, visible, onClose, statusOptions }) => {
  const theme = useTheme();
  const dispatch = useDispatchContext();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const finalStatusOptions = statusOptions || DEFAULT_STATUS_OPTIONS;

  const getStatusLabel = (status) => {
    return t(`bookingStatus.${status}`) || status;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: theme.palette.warning.main,
      confirmed: theme.palette.success.main,
      cancelled_by_user: theme.palette.error.main,
      cancelled_by_restaurant: theme.palette.error.dark,
      no_show: theme.palette.error.light,
      arrived: theme.palette.info.main,
      seated: theme.palette.info.dark,
      bill: theme.palette.warning.dark,
      clean: theme.palette.info.light,
      completed: theme.palette.success.dark,
    };
    return statusColors[status] || theme.palette.text.secondary;
  };

  const mutation = useMutation({
    mutationFn: (newStatus) => changeBookingStatus({
      reservation_id: booking.id,
      status: newStatus,
    }),
    onSuccess: (data, newStatus) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: `${t('bookings.statusUpdated')}: ${getStatusLabel(newStatus)}`,
        },
      });
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['tables-by-restaurant'] });
      onClose?.();
    },
    onError: (error) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.response?.data?.detail || t('bookings.errorUpdatingStatus'),
        },
      });
    },
  });

  const handleStatusChange = (newStatus) => {
    if (newStatus !== booking.status) {
      mutation.mutate(newStatus);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('bookingStatus.selectStatusTitle')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.palette.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.currentStatusContainer}>
            <Text style={styles.currentStatusLabel}>{t('bookings.currentStatus')}:</Text>
            <View style={[styles.currentStatusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
              <Text style={styles.currentStatusText}>
                {getStatusLabel(booking.status)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.statusList}>
            {finalStatusOptions.map((status) => {
              const isCurrentStatus = status === booking.status;
              const statusColor = getStatusColor(status);

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    isCurrentStatus && styles.statusOptionCurrent,
                    { borderColor: statusColor },
                  ]}
                  onPress={() => handleStatusChange(status)}
                  disabled={isCurrentStatus || mutation.isPending}
                >
                  <View style={styles.statusOptionContent}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text
                      style={[
                        styles.statusOptionText,
                        isCurrentStatus && styles.statusOptionTextCurrent,
                      ]}
                    >
                      {getStatusLabel(status)}
                    </Text>
                  </View>
                  {isCurrentStatus && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={statusColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    ...theme.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.palette.background.elevated,
  },
  currentStatusLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  currentStatusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  currentStatusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.primary.contrastText,
  },
  statusList: {
    padding: theme.spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    backgroundColor: theme.palette.background.paper,
  },
  statusOptionCurrent: {
    backgroundColor: theme.palette.background.elevated,
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusOptionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusOptionTextCurrent: {
    fontWeight: theme.typography.fontWeight.bold,
  },
});
