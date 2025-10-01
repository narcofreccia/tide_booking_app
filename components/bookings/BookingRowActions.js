import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useStateContext, useDispatchContext } from '../../context/ContextProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBooking } from '../../services/api';
import { isAdmin, isOwner } from '../../services/getUserRole';
import { ChangeBookingStatus } from './ChangeBookingStatus';

export const BookingRowActions = ({ booking, onActionComplete }) => {
  const theme = useTheme();
  const { currentUser } = useStateContext();
  const dispatch = useDispatchContext();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const isUserAdminOrOwner = isAdmin(currentUser) || isOwner(currentUser);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteBooking({ id: booking.id }),
    onMutate: () => dispatch({ type: 'START_LOADING' }),
    onSuccess: () => {
      dispatch({ type: 'END_LOADING' });
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: 'Booking deleted successfully',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onActionComplete?.();
    },
    onError: (error) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.response?.data?.detail || 'Error deleting booking',
        },
      });
      dispatch({ type: 'END_LOADING' });
    },
    onSettled: () => {
      dispatch({ type: 'END_LOADING' });
      dispatch({ type: 'CLOSE_DIALOG' });
    },
  });

  const handleDelete = () => {
    dispatch({
      type: 'OPEN_DIALOG',
      payload: {
        title: 'Delete Booking',
        message: 'Are you sure you want to delete this booking?',
        onSubmit: () => deleteMutation.mutate(),
      },
    });
  };

  const handleMove = () => {
    // TODO: Implement move booking functionality
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'info',
        message: 'Move booking - Coming soon',
      },
    });
    onActionComplete?.();
  };

  const handleUpdateStatus = () => {
    setShowStatusModal(true);
  };

  const handleStatusModalClose = () => {
    setShowStatusModal(false);
    onActionComplete?.();
  };

  const handleEdit = () => {
    // TODO: Implement edit booking functionality
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'info',
        message: 'Edit booking - Coming soon',
      },
    });
    onActionComplete?.();
  };

  return (
    <>
      <View style={styles.actionsContainer}>
      {/* Move */}
      <TouchableOpacity style={[styles.actionButton, styles.moveButton]} onPress={handleMove}>
        <Ionicons name="swap-horizontal" size={20} color={theme.palette.primary.contrastText} />
      </TouchableOpacity>

      {/* Update Status */}
      <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={handleUpdateStatus}>
        <Ionicons name="checkmark-circle" size={20} color={theme.palette.primary.contrastText} />
      </TouchableOpacity>

      {/* Edit */}
      <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
        <Ionicons name="create" size={20} color={theme.palette.primary.contrastText} />
      </TouchableOpacity>

      {/* Delete - Only for admin/owner */}
      {isUserAdminOrOwner && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Ionicons name="trash" size={20} color={theme.palette.primary.contrastText} />
        </TouchableOpacity>
      )}
      </View>

      <ChangeBookingStatus
        booking={booking}
        visible={showStatusModal}
        onClose={handleStatusModalClose}
      />
    </>
  );
};

const createStyles = (theme) => StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingRight: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  moveButton: {
    backgroundColor: theme.palette.info.main,
  },
  statusButton: {
    backgroundColor: theme.palette.success.main,
  },
  editButton: {
    backgroundColor: theme.palette.primary.main,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
  },
});
