import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../../theme'
import { getAllTablesByRestaurantId, getBookingsByDate, getFloorById } from '../../services/api'
import { TablesMapReadOnly } from './TablesMapReadOnly'
import { BookingDetailsModal } from './BookingDetailsModal'

/**
 * BookingsCanvas
 * Fetches tables, bookings, and floor data, then renders the map
 * Props:
 * - restaurantId: number (required)
 * - sectionId: number|null
 * - floorId: number|null
 * - date: string (YYYY-MM-DD)
 * - interval: { start_time: string, end_time: string }|null
 */
export const BookingsCanvas = ({ restaurantId, sectionId, floorId, date, interval }) => {
  const theme = useTheme()
  const [selectedTable, setSelectedTable] = React.useState(null)
  const [selectedBookings, setSelectedBookings] = React.useState([])
  const [modalVisible, setModalVisible] = React.useState(false)

  // Fetch floor data
  const { data: floor, isLoading: isFloorLoading } = useQuery({
    queryKey: ['floor', floorId],
    queryFn: () => getFloorById(floorId),
    enabled: !!floorId,
  })

  // Fetch tables
  const { data: tables = [], isLoading: isTablesLoading } = useQuery({
    queryKey: ['tables-by-restaurant', restaurantId, sectionId, date, interval?.start_time, interval?.end_time],
    queryFn: () => getAllTablesByRestaurantId(restaurantId, { 
      section_id: sectionId ?? undefined, 
      date: date,
      start_time: interval?.start_time,
      end_time: interval?.end_time,
    }),
    enabled: !!restaurantId && !!sectionId,
  })

  // Fetch bookings
  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['bookings-by-date', restaurantId, date, interval?.start_time, interval?.end_time],
    queryFn: () => getBookingsByDate(restaurantId, {
      reservation_date: date,
      start_time: interval?.start_time,
      end_time: interval?.end_time,
    }),
    enabled: !!restaurantId && !!sectionId && !!date,
  })

  // Group bookings by table_id
  const bookingsByTable = React.useMemo(() => {
    const grouped = {}
    const freeTableStatuses = ['no_show', 'completed', 'cancelled_by_restaurant', 'cancelled_by_user']
    
    bookings.forEach(booking => {
      if (freeTableStatuses.includes(booking.status)) {
        return
      }
      
      if (booking.table_ids && Array.isArray(booking.table_ids)) {
        booking.table_ids.forEach(tableId => {
          if (!grouped[tableId]) grouped[tableId] = []
          grouped[tableId].push(booking)
        })
      }
    })
    return grouped
  }, [bookings])

  const handleTablePress = (tableId, bookings) => {
    const table = tables.find(t => t.id === tableId)
    setSelectedTable(table)
    setSelectedBookings(bookings)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedTable(null)
    setSelectedBookings([])
  }

  if (!sectionId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.palette.text.secondary }]}>
          Seleziona una sezione per visualizzare la mappa dei tavoli
        </Text>
      </View>
    )
  }

  if (isFloorLoading || isTablesLoading || isBookingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text style={[styles.loadingText, { color: theme.palette.text.secondary }]}>
          Caricamento mappa...
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TablesMapReadOnly
        floor={floor}
        tables={tables}
        bookingsByTable={bookingsByTable}
        onTablePress={handleTablePress}
      />

      <BookingDetailsModal
        visible={modalVisible}
        bookings={selectedBookings}
        tableName={selectedTable?.number || selectedTable?.name || selectedTable?.id}
        onClose={handleCloseModal}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
})
