import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { getBookingStatusColor } from '../../constants/bookingStatusColors'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * SwitchBookingPositionDrawer
 * A minimal bottom drawer for table switching mode
 * Shows source booking info and selected target table
 * Props:
 * - open: boolean - Whether the drawer is open
 * - onClose: () => void - Called when drawer closes
 * - sourceBooking: object - The booking to move
 * - selectedTableId: number|null - Currently selected target table
 * - selectedTableName: string|null - Name/number of selected table
 * - onConfirm: () => void - Called when switch is confirmed
 * - onCancel: () => void - Called when operation is cancelled
 */
export const SwitchBookingPositionDrawer = ({ 
  open, 
  onClose, 
  sourceBooking, 
  selectedTableId,
  selectedTableName,
  onConfirm, 
  onCancel
}) => {
  const theme = useTheme()
  const { t } = useTranslation()

  const getSourceTableNumbers = () => {
    if (!sourceBooking?.table_ids || sourceBooking.table_ids.length === 0) {
      return t('map.noTable')
    }
    return sourceBooking.table_ids.join(', ')
  }

  const canConfirm = selectedTableId && sourceBooking

  if (!open) return null

  return (
    <View style={styles.overlay}>
      <View style={[styles.drawer, { backgroundColor: theme.palette.background.paper }]}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="swap-horizontal" 
            size={20} 
            color={theme.palette.primary.main} 
          />
          <Text style={[styles.title, { color: theme.palette.text.primary }]}>
            {t('map.switchMode')}
          </Text>
          <TouchableOpacity onPress={onCancel || onClose} style={styles.closeButton}>
            <MaterialCommunityIcons 
              name="close" 
              size={20} 
              color={theme.palette.text.secondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Compact Info Section */}
        <View style={styles.content}>
          <View style={styles.compactRow}>
            <Text style={[styles.compactText, { color: theme.palette.text.primary }]}>
              {sourceBooking?.name} {sourceBooking?.surname}
            </Text>
            <Text style={[styles.compactLabel, { color: theme.palette.text.secondary }]}>
              ({getSourceTableNumbers()})
            </Text>
            
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={16} 
              color={theme.palette.text.secondary} 
              style={styles.arrow}
            />
            
            {selectedTableId ? (
              <>
                <Text style={[styles.compactText, { color: theme.palette.primary.main }]}>
                  {t('map.table')} {selectedTableName || selectedTableId}
                </Text>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={16} 
                  color={theme.palette.success?.main || '#4caf50'} 
                  style={styles.checkIcon}
                />
              </>
            ) : (
              <Text style={[styles.compactLabel, { color: theme.palette.text.secondary }]}>
                {t('map.selectTable')}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton, { 
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.default
            }]}
            onPress={onCancel || onClose}
          >
            <Text style={[styles.buttonText, { color: theme.palette.text.primary }]}>
              {t('map.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.confirmButton, 
              { backgroundColor: canConfirm ? theme.palette.primary.main : '#CCCCCC' }
            ]}
            onPress={onConfirm}
            disabled={!canConfirm}
          >
            <MaterialCommunityIcons 
              name="check" 
              size={16} 
              color="white" 
            />
            <Text style={[styles.buttonText, { color: 'white', marginLeft: 6 }]}>
              {t('map.confirmSwitch')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  drawer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 2,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  compactText: {
    fontSize: 13,
    fontWeight: '600',
  },
  compactLabel: {
    fontSize: 12,
  },
  arrow: {
    marginHorizontal: 2,
  },
  checkIcon: {
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
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
  confirmButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
