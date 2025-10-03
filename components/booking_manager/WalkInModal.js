import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatchContext } from '../../context/ContextProvider'
import { createWalkInBooking } from '../../services/bookingApi'

/**
 * WalkInModal
 * Simple modal for creating walk-in reservations
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - tableId: number - The table ID for the walk-in
 * - tableName: string - The table name/number
 * - restaurantId: number
 * - date: string (YYYY-MM-DD)
 */
export const WalkInModal = ({ visible, onClose, tableId, tableName, restaurantId, date }) => {
  const theme = useTheme()
  const dispatch = useDispatchContext()
  const queryClient = useQueryClient()
  const styles = createStyles(theme)

  const [pax, setPax] = useState('2')
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: (payload) => createWalkInBooking(restaurantId, payload),
    onSuccess: () => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: 'Walk-in creato con successo',
        },
      })
      
      // Invalidate queries to refresh the map and bookings list
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] })
      queryClient.invalidateQueries({ queryKey: ['tables-by-restaurant'] })
      
      // Reset form and close
      setPax('2')
      setNotes('')
      onClose()
    },
    onError: (error) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.response?.data?.detail || 'Errore creazione walk-in',
        },
      })
    },
  })

  const handleSubmit = () => {
    const payload = {
      restaurant_id: restaurantId,
      table_ids: tableId ? [tableId] : null,
      adults: Number(pax) || 2,
      restaurant_notes: notes || null,
      reservation_date: date,
    }
    
    mutation.mutate(payload)
  }

  const handleClose = () => {
    setPax('2')
    setNotes('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modalContainer, { backgroundColor: theme.palette.background.paper }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.palette.divider }]}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons 
                name="walk" 
                size={24} 
                color={theme.palette.primary.main} 
              />
              <Text style={[styles.title, { color: theme.palette.text.primary }]}>
                Nuovo Walk-In
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={theme.palette.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Table Info */}
            <View style={[styles.infoBox, { backgroundColor: theme.palette.background.default }]}>
              <Text style={[styles.infoLabel, { color: theme.palette.text.secondary }]}>
                Tavolo
              </Text>
              <Text style={[styles.infoValue, { color: theme.palette.text.primary }]}>
                {tableName || tableId}
              </Text>
            </View>

            {/* PAX Input */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.palette.text.primary }]}>
                Persone (PAX) *
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider
                }]}
                value={pax}
                onChangeText={setPax}
                keyboardType="number-pad"
                placeholder="2"
                placeholderTextColor={theme.palette.text.disabled}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.palette.text.primary }]}>
                Note ristorante (opzionale)
              </Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider
                }]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholder="Aggiungi note..."
                placeholderTextColor={theme.palette.text.disabled}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.palette.divider }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { 
                borderColor: theme.palette.divider,
                backgroundColor: theme.palette.background.default
              }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: theme.palette.text.primary }]}>
                Annulla
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { 
                backgroundColor: theme.palette.primary.main
              }]}
              onPress={handleSubmit}
              disabled={mutation.isPending}
            >
              <MaterialCommunityIcons 
                name="check" 
                size={16} 
                color="#FFFFFF" 
              />
              <Text style={[styles.buttonText, { color: '#FFFFFF', marginLeft: 6 }]}>
                {mutation.isPending ? 'Creazione...' : 'Crea Walk-In'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
