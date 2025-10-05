import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { getBookingStatusColor, getBookingStatusLabel } from '../../constants/bookingStatusColors'
import { useTranslation } from '../../hooks/useTranslation'
import { useStateContext } from '../../context/ContextProvider'
import { getLocale } from '../../utils/localeUtils'
import { ChangeBookingStatus } from '../bookings/ChangeBookingStatus'
import { EditBookingModal } from '../bookings/EditBookingModal'
import { WalkInModal } from './WalkInModal'

/**
 * BookingDetailsModal
 * Bottom sheet modal showing booking details when a table is clicked
 * Props:
 * - visible: boolean
 * - bookings: Array of booking objects
 * - tableName: string
 * - onClose: () => void
 */
export const BookingDetailsModal = ({ visible, bookings = [], tableName, tableId, onClose, onSwitchBooking, restaurantId, date }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { language } = useStateContext()
  const [changeStatusModalVisible, setChangeStatusModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [walkInModalVisible, setWalkInModalVisible] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.slice(0, 5) // HH:mm
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const locale = getLocale(language, 'it-IT')
    return date.toLocaleDateString(locale, {
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
                {t('bookingDetails.tableTitle', { tableName })}
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
                ? t('bookingDetails.noBooking') 
                : t(bookings.length > 1 ? 'bookingDetails.bookingCountPlural' : 'bookingDetails.bookingCount', { count: bookings.length })}
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {bookings.length === 0 ? (
              <>
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.palette.text.secondary }]}>
                    {t('bookingDetails.tableFree')}
                  </Text>
                </View>
                
                {/* Walk-In button for empty table */}
                <View style={styles.emptyActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { 
                      backgroundColor: theme.palette.success?.main || '#4caf50',
                      borderColor: theme.palette.success?.main || '#4caf50'
                    }]}
                    onPress={() => {
                      setWalkInModalVisible(true)
                    }}
                  >
                    <MaterialCommunityIcons 
                      name="walk" 
                      size={16} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.actionButtonText}>
                      {t('bookingDetails.createWalkIn')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
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
                        {(booking.adults || 0) + (booking.children || 0)} {t('bookingDetails.people')}
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
                          {Number(booking.highchair_number) > 0 && `${t('bookingDetails.highchairs')}: ${booking.highchair_number}`}
                          {Number(booking.highchair_number) > 0 && Number(booking.wheelchair_number) > 0 && ' • '}
                          {Number(booking.wheelchair_number) > 0 && `${t('bookingDetails.wheelchairs')}: ${booking.wheelchair_number}`}
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
                          {booking.amount > 0 ? `€${Number(booking.amount).toFixed(2)}` : t('bookingDetails.deposit')}
                          {booking.payment_status && ` • ${booking.payment_status}`}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons - 2x2 Grid */}
                  <View style={styles.actionsSection}>
                    {/* First Row */}
                    <View style={styles.actionRow}>
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
                          {t('bookingDetails.move')}
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
                          {t('bookingDetails.status')}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Second Row */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonHalf, { 
                          backgroundColor: theme.palette.warning?.main || '#ff9800',
                          borderColor: theme.palette.warning?.main || '#ff9800'
                        }]}
                        onPress={() => {
                          setSelectedBooking(booking)
                          setEditModalVisible(true)
                        }}
                      >
                        <MaterialCommunityIcons 
                          name="pencil" 
                          size={16} 
                          color="#FFFFFF" 
                        />
                        <Text style={styles.actionButtonText}>
                          {t('bookingDetails.edit')}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonHalf, { 
                          backgroundColor: theme.palette.success?.main || '#4caf50',
                          borderColor: theme.palette.success?.main || '#4caf50'
                        }]}
                        onPress={() => {
                          setWalkInModalVisible(true)
                        }}
                      >
                        <MaterialCommunityIcons 
                          name="walk" 
                          size={16} 
                          color="#FFFFFF" 
                        />
                        <Text style={styles.actionButtonText}>
                          {t('bookingDetails.walkIn')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Notes */}
                  {booking.costumer_notes && (
                    <View style={[styles.notesSection, { borderTopColor: theme.palette.divider }]}>
                      <Text style={[styles.notesLabel, { color: theme.palette.text.secondary }]}>
                        {t('bookingDetails.customerNotes')}
                      </Text>
                      <Text style={[styles.notesText, { color: theme.palette.text.primary }]}>
                        {booking.costumer_notes}
                      </Text>
                    </View>
                  )}

                  {booking.restaurant_notes && (
                    <View style={[styles.notesSection, { borderTopColor: theme.palette.divider }]}>
                      <Text style={[styles.notesLabel, { color: theme.palette.text.secondary }]}>
                        {t('bookingDetails.restaurantNotes')}
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
          }}
        />
      )}

      {/* Edit Booking Modal */}
      {selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false)
            setSelectedBooking(null)
          }}
        />
      )}

      {/* Walk-In Modal */}
      <WalkInModal
        visible={walkInModalVisible}
        onClose={() => {
          setWalkInModalVisible(false)
        }}
        tableId={tableId}
        tableName={tableName}
        restaurantId={restaurantId}
        date={date}
      />
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
  emptyActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    gap: 8,
  },
  actionRow: {
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
