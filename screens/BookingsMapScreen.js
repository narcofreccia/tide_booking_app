import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme'
import { useStateContext } from '../context/ContextProvider'
import { useQueryClient } from '@tanstack/react-query'
import { DateSelector } from '../components/DateSelector'
import { SectionIntervalBar } from '../components/booking_manager/SectionIntervalBar'
import { BookingsCanvas } from '../components/booking_manager/BookingsCanvas'
import { SwitchBookingPositionDrawer } from '../components/booking_manager/SwitchBookingPositionDrawer'
import { TideLogo } from '../components/TideLogo'
import { switchTablePosition } from '../services/bookingApi'

export default function BookingsMapScreen() {
  const theme = useTheme()
  const { selectedRestaurant, currentUser } = useStateContext()
  const queryClient = useQueryClient()
  const styles = createStyles(theme)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [selectedInterval, setSelectedInterval] = useState(null)
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState(null)
  
  // Table switching state
  const [switchDrawerOpen, setSwitchDrawerOpen] = useState(false)
  const [switchingBooking, setSwitchingBooking] = useState(null)
  const [selectedTargetTable, setSelectedTargetTable] = useState(null)
  const [selectedTargetTableName, setSelectedTargetTableName] = useState(null)
  const [tables, setTables] = useState([])

  const restaurantId = selectedRestaurant?.id || currentUser?.restaurant_id
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }
  const dateStr = formatDate(selectedDate)

  const handleSectionChange = (sectionId, floorId) => {
    setSelectedSectionId(sectionId)
    setSelectedFloorId(floorId)
  }

  const handleIntervalChange = (interval, index) => {
    setSelectedInterval(interval)
    setSelectedIntervalIndex(index)
  }

  // Handle switching booking position
  const handleSwitchBooking = (booking) => {
    setSwitchingBooking(booking)
    setSwitchDrawerOpen(true)
    setSelectedTargetTable(null)
  }

  const handleTableSwitch = (targetTableId) => {
    setSelectedTargetTable(targetTableId)
    // Find the table name/number from the tables array
    const table = tables.find(t => t.id === targetTableId)
    setSelectedTargetTableName(table?.number || table?.name || targetTableId)
  }
  
  // Callback to receive tables from BookingsCanvas
  const handleTablesLoaded = (loadedTables) => {
    setTables(loadedTables)
  }

  const handleConfirmSwitch = async () => {
    if (!switchingBooking || !selectedTargetTable) return

    try {
      const result = await switchTablePosition({
        source_booking_id: switchingBooking.id,
        target_table_id: selectedTargetTable
      })
      
      // Invalidate bookings queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['bookings-by-date', restaurantId, dateStr]
      })
      
      // Also invalidate tables query to refresh table states
      await queryClient.invalidateQueries({
        queryKey: ['tables-by-restaurant', restaurantId]
      })
      
      // Close drawer and reset state
      handleCancelSwitch()
      
      // Show success message (you might want to add a toast/alert system)
      console.log(result.length > 1 ? 'Prenotazioni scambiate con successo' : 'Prenotazione spostata con successo')
    } catch (error) {
      console.error('Errore durante lo spostamento della prenotazione:', error)
    }
  }

  const handleCancelSwitch = () => {
    setSwitchDrawerOpen(false)
    setSwitchingBooking(null)
    setSelectedTargetTable(null)
    setSelectedTargetTableName(null)
  }

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Mappa Prenotazioni</Text>
            <Text style={styles.subtitle}>
              {selectedRestaurant?.name || 'Seleziona un ristorante'}
            </Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          format="day"
        />
      </View>

      {/* Section and Interval Selectors */}
      {restaurantId && (
        <View style={styles.selectorsContainer}>
          <SectionIntervalBar
            restaurantId={restaurantId}
            date={dateStr}
            selectedSectionId={selectedSectionId}
            selectedIntervalIndex={selectedIntervalIndex}
            onSectionChange={handleSectionChange}
            onIntervalChange={handleIntervalChange}
          />
        </View>
      )}

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        {!restaurantId ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Seleziona un ristorante dalle impostazioni
            </Text>
          </View>
        ) : (
          <BookingsCanvas
            restaurantId={restaurantId}
            sectionId={selectedSectionId}
            floorId={selectedFloorId}
            date={dateStr}
            interval={selectedInterval}
            onSwitchBooking={handleSwitchBooking}
            switchingMode={switchDrawerOpen}
            onTableSelect={handleTableSwitch}
            selectedTableId={selectedTargetTable}
          />
        )}
      </View>

    {/* Table Switching Drawer */}
    {switchDrawerOpen && (
      <SwitchBookingPositionDrawer
        open={switchDrawerOpen}
        onClose={handleCancelSwitch}
        sourceBooking={switchingBooking}
        selectedTableId={selectedTargetTable}
        selectedTableName={selectedTargetTableName}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />
    )}
    </>
  )
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  dateContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  selectorsContainer: {
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider
  },
  canvasContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
})
