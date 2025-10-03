import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useTheme } from '../theme'
import { useStateContext } from '../context/ContextProvider'
import { DateSelector } from '../components/DateSelector'
import { SectionIntervalBar } from '../components/booking_manager/SectionIntervalBar'
import { BookingsCanvas } from '../components/booking_manager/BookingsCanvas'
import { TideLogo } from '../components/TideLogo'

export default function BookingsMapScreen() {
  const theme = useTheme()
  const { selectedRestaurant, currentUser } = useStateContext()
  const styles = createStyles(theme)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedFloorId, setSelectedFloorId] = useState(null)
  const [selectedInterval, setSelectedInterval] = useState(null)

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
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
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
            selectedIntervalIndex={selectedInterval ? 0 : -1}
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
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
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
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  selectorsContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
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
