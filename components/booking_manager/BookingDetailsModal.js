import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { getBookingStatusColor, getBookingStatusLabel } from '../../constants/bookingStatusColors'
import { ChangeBookingStatus } from '../bookings/ChangeBookingStatus'

/**
 * BookingDetailsModal
 * Bottom sheet modal showing booking details when a table is clicked
 * Props:
 * - visible: boolean
 * - bookings: Array of booking objects
 * - tableName: string
 * - onClose: () => void
 */
export const BookingDetailsModal = ({ visible, bookings = [], tableName, onClose, onSwitchBooking }) => {
  const theme = useTheme()
  const [changeStatusModalVisible, setChangeStatusModalVisible] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.slice(0, 5) // HH:mm
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.modalContainer, { backgroundColor: theme.palette.background.paper }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.palette.divider }]}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: theme.palette.text.primary }]}>
                🪑 Tavolo {tableName}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={theme.palette.text.secondary} 
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: theme.palette.text.secondary }]}>
              {bookings.length === 0 
                ? 'Nessuna prenotazione' 
                : `${bookings.length} prenotazione${bookings.length > 1 ? 'i' : ''}`}
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {bookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.palette.text.secondary }]}>
                  Tavolo libero
                </Text>
              </View>
            ) : (
              bookings.map((booking, index) => (
                <View 
                  key={booking.id} 
                  style={[
                    styles.bookingCard,
                    { 
                      backgroundColor: theme.palette.background.default,
                      borderColor: theme.palette.divider,
                    }
                  ]}
                >
                  {/* Booking header with status */}
                  <View style={styles.bookingHeader}>
                    <Text style={[styles.customerName, { color: theme.palette.text.primary }]}>
                      {booking.name} {booking.surname}
                    </Text>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: getBookingStatusColor(booking.status) }
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getBookingStatusLabel(booking.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Booking details */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="calendar" 
                        size={16} 
                        color={theme.palette.text.secondary} 
                      />
                      <Text style={[styles.detailText, { color: theme.palette.text.secondary }]}>
                        {formatDate(booking.reservation_date)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="clock-outline" 
                        size={16} 
                        color={theme.palette.text.secondary} 
                      />
                      <Text style={[styles.detailText, { color: theme.palette.text.secondary }]}>
                        {formatTime(booking.arrival_time)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="account-group" 
                        size={16} 
                        color={theme.palette.text.secondary} 
                      />
                      <Text style={[styles.detailText, { color: theme.palette.text.secondary }]}>
                        {(booking.adults || 0) + (booking.children || 0)} persone
                      </Text>
                    </View>

                    {booking.phone && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons 
                          name="phone" 
                          size={16} 
                          color={theme.palette.text.secondary} 
                        />
                        <Text style={[styles.detailText, { color: theme.palette.text.secondary }]}>
                          {booking.phone}
                        </Text>
                      </View>
                    )}

                    {(Number(booking.highchair_number) > 0 || Number(booking.wheelchair_number) > 0) && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons 
                          name="wheelchair-accessibility" 
                          size={16} 
                          color={theme.palette.text.secondary} 
                        />
                        <Text style={[styles.detailText, { color: theme.palette.text.secondary }]}>
                          {Number(booking.highchair_number) > 0 && `Seggioloni: ${booking.highchair_number}`}
                          {Number(booking.highchair_number) > 0 && Number(booking.wheelchair_number) > 0 && ' • '}
                          {Number(booking.wheelchair_number) > 0 && `Sedie a rotelle: ${booking.wheelchair_number}`}
                        </Text>
                      </View>
                    )}

                    {(booking.amount > 0 || booking.payment_status) && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons 
                          name="credit-card" 
                          size={16} 
                          color={theme.palette.text.secondary} 
                        />
                        <Text style={[styles.detailText, { color: theme.palette.text.secondary }]}>
                          {booking.amount > 0 ? `€${Number(booking.amount).toFixed(2)}` : 'Deposito'}
                          {booking.payment_status && ` • ${booking.payment_status}`}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonHalf, { 
                        backgroundColor: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main 
                      }]}
                      onPress={() => {
                        onSwitchBooking?.(booking)
                        onClose()
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="swap-horizontal" 
                        size={16} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.actionButtonText}>
                        Sposta
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonHalf, { 
                        backgroundColor: theme.palette.secondary?.main || theme.palette.info.main,
                        borderColor: theme.palette.secondary?.main || theme.palette.info.main
                      }]}
                      onPress={() => {
                        setSelectedBooking(booking)
                        setChangeStatusModalVisible(true)
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="checkbox-marked-circle-outline" 
                        size={16} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.actionButtonText}>
                        Stato
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Notes */}
                  {booking.costumer_notes && (
                    <View style={[styles.notesSection, { borderTopColor: theme.palette.divider }]}>
                      <Text style={[styles.notesLabel, { color: theme.palette.text.secondary }]}>
                        Note Cliente:
                      </Text>
                      <Text style={[styles.notesText, { color: theme.palette.text.primary }]}>
                        {booking.costumer_notes}
                      </Text>
                    </View>
                  )}

                  {booking.restaurant_notes && (
                    <View style={[styles.notesSection, { borderTopColor: theme.palette.divider }]}>
                      <Text style={[styles.notesLabel, { color: theme.palette.text.secondary }]}>
                        Note Ristorante:
                      </Text>
                      <Text style={[styles.notesText, { color: theme.palette.text.primary }]}>
                        {booking.restaurant_notes}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Change Status Modal */}
      {selectedBooking && (
        <ChangeBookingStatus
          booking={selectedBooking}
          visible={changeStatusModalVisible}
          onClose={() => {
            setChangeStatusModalVisible(false)
            setSelectedBooking(null)
            // Close the BookingDetailsModal after status change
            onClose()
          }}
        />
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  bookingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionsSection: {
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonHalf: {
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
})
