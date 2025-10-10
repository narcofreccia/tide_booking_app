import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useStateContext, useDispatchContext } from '../../context/ContextProvider';
import { confirmVoiceBooking, cancelVoiceBooking } from '../../services/voiceApi';

/**
 * Modal to review and confirm voice booking
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Object} props.booking - Booking object from backend
 * @param {Function} props.onConfirm - Callback when booking is confirmed
 * @param {Function} props.onCancel - Callback when booking is cancelled
 * @param {Function} props.onClose - Callback to close modal
 */
export const VoiceBookingConfirmationModal = ({
  visible,
  booking,
  onConfirm,
  onCancel,
  onClose
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatchContext();
  const { loading } = useStateContext();
  const queryClient = useQueryClient();
  
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  
  if (!booking) return null;
  
  const handleConfirm = async () => {
    dispatch({ type: 'START_LOADING' });
    try {
      const updates = editing ? editedData : {};
      await confirmVoiceBooking(booking.id, updates);
      
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['tables-by-restaurant'] });
      
      dispatch({ type: 'END_LOADING' });
      onConfirm?.(booking.id);
      onClose();
    } catch (error) {
      dispatch({ type: 'END_LOADING' });
      console.error('Failed to confirm booking:', error);
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: t('Failed to confirm booking. Please try again.')
        }
      });
    }
  };
  
  const handleCancel = async () => {
    dispatch({ type: 'START_LOADING' });
    try {
      await cancelVoiceBooking(booking.id);
      
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['tables-by-restaurant'] });
      
      dispatch({ type: 'END_LOADING' });
      onCancel?.(booking.id);
      onClose();
    } catch (error) {
      dispatch({ type: 'END_LOADING' });
      console.error('Failed to cancel booking:', error);
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: t('Failed to cancel booking. Please try again.')
        }
      });
    }
  };
  
  const getValue = (field) => {
    return editing && editedData[field] !== undefined ? editedData[field] : booking[field];
  };
  
  const setValue = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.palette.background.paper }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name="microphone-variant"
                size={24}
                color={theme.palette.primary.main}
              />
              <Text style={[styles.title, { color: theme.palette.text.primary }]}>
                {t('Voice Booking')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.palette.text.secondary}
              />
            </TouchableOpacity>
          </View>
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: theme.palette.warning.light }]}>
            <MaterialCommunityIcons
              name="clock-alert-outline"
              size={16}
              color={theme.palette.warning.dark}
            />
            <Text style={[styles.statusText, { color: theme.palette.warning.dark }]}>
              {t('Pending Confirmation')}
            </Text>
          </View>
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Customer Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.palette.text.secondary }]}>
                {t('Customer Information')}
              </Text>
              
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                  {t('Name')}
                </Text>
                {editing ? (
                  <View style={styles.nameRow}>
                    <TextInput
                      style={[styles.input, styles.nameInput, { 
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider
                      }]}
                      value={getValue('name')}
                      onChangeText={(text) => setValue('name', text)}
                      placeholder={t('First name')}
                      placeholderTextColor={theme.palette.text.disabled}
                    />
                    <TextInput
                      style={[styles.input, styles.nameInput, { 
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider
                      }]}
                      value={getValue('surname')}
                      onChangeText={(text) => setValue('surname', text)}
                      placeholder={t('Last name')}
                      placeholderTextColor={theme.palette.text.disabled}
                    />
                  </View>
                ) : (
                  <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                    {booking.name} {booking.surname}
                  </Text>
                )}
              </View>
              
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                  {t('Phone')}
                </Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider
                    }]}
                    value={getValue('phone')}
                    onChangeText={(text) => setValue('phone', text)}
                    placeholder={t('Phone number')}
                    placeholderTextColor={theme.palette.text.disabled}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                    {booking.phone || t('Not provided')}
                  </Text>
                )}
              </View>
              
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                  {t('Email')}
                </Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider
                    }]}
                    value={getValue('email')}
                    onChangeText={(text) => setValue('email', text)}
                    placeholder={t('Email address')}
                    placeholderTextColor={theme.palette.text.disabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                    {booking.email || t('Not provided')}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Booking Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.palette.text.secondary }]}>
                {t('Booking Details')}
              </Text>
              
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                    {t('Date')}
                  </Text>
                  <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                    {booking.reservation_date}
                  </Text>
                </View>
                
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                    {t('Time')}
                  </Text>
                  <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                    {booking.arrival_time}
                  </Text>
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                    {t('Adults')}
                  </Text>
                  {editing ? (
                    <TextInput
                      style={[styles.input, styles.smallInput, { 
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider
                      }]}
                      value={String(getValue('adults'))}
                      onChangeText={(text) => setValue('adults', parseInt(text) || 0)}
                      keyboardType="number-pad"
                    />
                  ) : (
                    <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                      {booking.adults}
                    </Text>
                  )}
                </View>
                
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                    {t('Children')}
                  </Text>
                  {editing ? (
                    <TextInput
                      style={[styles.input, styles.smallInput, { 
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.divider
                      }]}
                      value={String(getValue('children'))}
                      onChangeText={(text) => setValue('children', parseInt(text) || 0)}
                      keyboardType="number-pad"
                    />
                  ) : (
                    <Text style={[styles.value, { color: theme.palette.text.primary }]}>
                      {booking.children || 0}
                    </Text>
                  )}
                </View>
              </View>
              
              {booking.restaurant_notes && (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.palette.text.secondary }]}>
                    {t('Notes')}
                  </Text>
                  <Text style={[styles.value, styles.notes, { color: theme.palette.text.secondary }]}>
                    {booking.restaurant_notes}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          {/* Actions */}
          <View style={styles.actions}>
            {!editing && (
              <TouchableOpacity
                style={[styles.button, styles.editButton, { borderColor: theme.palette.primary.main }]}
                onPress={() => setEditing(true)}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color={theme.palette.primary.main}
                />
                <Text style={[styles.buttonText, { color: theme.palette.primary.main }]}>
                  {t('Edit')}
                </Text>
              </TouchableOpacity>
            )}
            
            {editing && (
              <TouchableOpacity
                style={[styles.button, styles.editButton, { borderColor: theme.palette.text.secondary }]}
                onPress={() => {
                  setEditing(false);
                  setEditedData({});
                }}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={theme.palette.text.secondary}
                />
                <Text style={[styles.buttonText, { color: theme.palette.text.secondary }]}>
                  {t('Cancel Edit')}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.palette.error.main }]}
              onPress={handleCancel}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#FFFFFF"
              />
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {t('Cancel Booking')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: theme.palette.success.main }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#FFFFFF"
              />
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {loading ? t('Confirming...') : t('Confirm Booking')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '600'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 400
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  field: {
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    gap: 16
  },
  nameRow: {
    flexDirection: 'row',
    gap: 8
  },
  nameInput: {
    flex: 1
  },
  label: {
    fontSize: 12,
    marginBottom: 4
  },
  value: {
    fontSize: 16
  },
  notes: {
    fontStyle: 'italic',
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  smallInput: {
    width: 80
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    flexWrap: 'wrap'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: 120
  },
  editButton: {
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  cancelButton: {
    flex: 1
  },
  confirmButton: {
    flex: 2
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  cancelButtonText: {
    color: '#FFFFFF'
  },
  confirmButtonText: {
    color: '#FFFFFF'
  }
});
