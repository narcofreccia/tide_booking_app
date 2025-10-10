import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useStateContext } from '../context/ContextProvider'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '../hooks/useTranslation'
import { DateSelector } from '../components/DateSelector'
import { SectionIntervalBar } from '../components/booking_manager/SectionIntervalBar'
import { BookingSummaryBar } from '../components/booking_manager/BookingSummaryBar'
import { BookingsCanvas } from '../components/booking_manager/BookingsCanvas'
import { SwitchBookingPositionDrawer } from '../components/booking_manager/SwitchBookingPositionDrawer'
import { TideLogo } from '../components/TideLogo'
import { VoiceRecorder } from '../components/recorder/VoiceRecorder'
import { getIcon, getIconSize } from '../config/icons'
import { switchTablePosition } from '../services/bookingApi'

export default function BookingsMapScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
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
  
  // Voice recorder state
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

  const restaurantId = selectedRestaurant?.id || currentUser?.restaurant_id
  
  // Format date to YYYY-MM-DD in local timezone
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // Reset interval selection when date changes
  React.useEffect(() => {

    setSelectedInterval(null)
    setSelectedIntervalIndex(null)
  }, [selectedDate])

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
    } catch (error) {
      console.error(t('map.errorSwitching'), error)
    }
  }

  const handleCancelSwitch = () => {
    setSwitchDrawerOpen(false)
    setSwitchingBooking(null)
    setSelectedTargetTable(null)
    setSelectedTargetTableName(null)
  }
  
  // If showing voice recorder, render VoiceRecorder instead
  if (showVoiceRecorder) {
    return (
      <View style={[styles.voiceRecorderContainer, { backgroundColor: theme.palette.background.default }]}>
        <View style={[styles.voiceRecorderHeader, { borderBottomColor: theme.palette.divider }]}>
          <TouchableOpacity onPress={() => setShowVoiceRecorder(false)} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.palette.text.primary}
            />
            <Text style={[styles.backText, { color: theme.palette.text.primary }]}>
              {t('map.title')}
            </Text>
          </TouchableOpacity>
        </View>
        <VoiceRecorder
          locale="it-IT"
          onTranscriptComplete={(result) => {
            console.log('Voice booking transcript:', result);
          }}
          onError={(error) => {
            console.error('Voice recording error:', error);
          }}
        />
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{t('map.title')}</Text>
            <Text style={styles.subtitle}>
              {selectedRestaurant?.name || t('map.selectRestaurantPrompt')}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => setShowVoiceRecorder(true)}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={getIconSize('lg')}
                color={theme.palette.primary.main}
              />
            </TouchableOpacity>
            <TideLogo size={32} />
          </View>
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

      {/* Section and Interval Selectors with Summary */}
      {restaurantId && (
        <View style={styles.selectorsContainer}>
          <View style={styles.selectorsRow}>
            <View style={styles.selectorsLeft}>
              <SectionIntervalBar
                restaurantId={restaurantId}
                date={dateStr}
                selectedSectionId={selectedSectionId}
                selectedIntervalIndex={selectedIntervalIndex}
                onSectionChange={handleSectionChange}
                onIntervalChange={handleIntervalChange}
              />
            </View>
            <BookingSummaryBar
              restaurantId={restaurantId}
              date={dateStr}
              interval={selectedInterval}
            />
          </View>
        </View>
      )}

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        {!restaurantId ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t('map.pleaseSelectRestaurant')}
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
  selectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  selectorsLeft: {
    flex: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  voiceButton: {
    padding: theme.spacing.xs,
  },
  voiceRecorderContainer: {
    flex: 1,
  },
  voiceRecorderHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
})
