import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useStateContext, useDispatchContext } from '../../context/ContextProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBooking } from '../../services/api';
import { isAdmin, isOwner } from '../../services/getUserRole';
import { ChangeBookingStatus } from './ChangeBookingStatus';
import { EditBookingModal } from './EditBookingModal';

export const BookingRowActions = ({ booking, onActionComplete }) => {
  const theme = useTheme();
  const { currentUser } = useStateContext();
  const dispatch = useDispatchContext();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      // Invalidate all booking-related queries to refresh the map
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['tables-by-restaurant'] });
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
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    onActionComplete?.();
  };

  return (
    <>
      <View style={styles.actionsContainer}>

      {/* Update Status */}
      <TouchableOpacity 
        style={[styles.actionButton, styles.statusButton]} 
        onPress={handleUpdateStatus}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Edit */}
      <TouchableOpacity 
        style={[styles.actionButton, styles.editButton]} 
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="pencil" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Delete - Only for admin/owner */}
      {isUserAdminOrOwner && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      </View>

      <ChangeBookingStatus
        booking={booking}
        visible={showStatusModal}
        onClose={handleStatusModalClose}
      />

      <EditBookingModal
        booking={booking}
        visible={showEditModal}
        onClose={handleEditModalClose}
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
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusButton: {
    backgroundColor: theme.palette.success?.main || '#4caf50',
  },
  editButton: {
    backgroundColor: theme.palette.primary.main,
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    opacity: 0.9,
  },
});
