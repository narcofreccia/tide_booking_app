import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useTheme } from '../../theme'
import { useQuery } from '@tanstack/react-query'
import { getSectionsByRestaurantRule } from '../../services/api'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * SectionIntervalBar
 * Combined section and interval selector for mobile
 * Props:
 * - restaurantId: number (required)
 * - date: string (YYYY-MM-DD)
 * - selectedSectionId: number|null
 * - selectedIntervalIndex: number|null (-1 for "All")
 * - onSectionChange: (sectionId, floorId) => void
 * - onIntervalChange: (interval, index) => void
 */
export const SectionIntervalBar = ({ 
  restaurantId, 
  date, 
  selectedSectionId, 
  selectedIntervalIndex,
  onSectionChange, 
  onIntervalChange 
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const todayStr = React.useMemo(() => {
    if (!date) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date
  }, [date])

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-sections-by-date', restaurantId, todayStr],
    queryFn: () => getSectionsByRestaurantRule(restaurantId, { date: todayStr }),
    enabled: !!restaurantId,
  })

  const sections = React.useMemo(() => {
    const s = data?.sections
    return Array.isArray(s) ? s : []
  }, [data])

  const timeRanges = React.useMemo(() => {
    const t = data?.time_ranges
    return Array.isArray(t) ? t : []
  }, [data])

  // Auto-select first section if none selected
  React.useEffect(() => {
    if (selectedSectionId == null && sections.length > 0) {
      const firstSection = sections[0]
      if (firstSection?.id != null) {
        onSectionChange?.(firstSection.id, firstSection.floor_id)
      }
    }
  }, [sections, selectedSectionId, onSectionChange])

  // Auto-select appropriate interval based on current time
  React.useEffect(() => {
    if (selectedIntervalIndex != null || !timeRanges || timeRanges.length === 0) {
      return
    }

    const now = new Date()
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    
    const sortedTimeRanges = [...timeRanges].sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0
      return a.start_time.localeCompare(b.start_time)
    })
    
    let targetIndex = -1

    for (let i = 0; i < sortedTimeRanges.length; i++) {
      const tr = sortedTimeRanges[i]
      if (tr.start_time && tr.end_time && currentTime >= tr.start_time && currentTime <= tr.end_time) {
        targetIndex = timeRanges.findIndex(original => 
          original.start_time === tr.start_time && original.end_time === tr.end_time
        )
        break
      }
    }

    if (targetIndex === -1) {
      for (let i = 0; i < sortedTimeRanges.length; i++) {
        const tr = sortedTimeRanges[i]
        if (tr.start_time && currentTime < tr.start_time) {
          targetIndex = timeRanges.findIndex(original => 
            original.start_time === tr.start_time && original.end_time === tr.end_time
          )
          break
        }
      }
    }

    if (targetIndex === -1) {
      onIntervalChange?.(null, targetIndex)
    } else {
      const interval = timeRanges[targetIndex]
      if (interval) onIntervalChange?.(interval, targetIndex)
    }
  }, [selectedIntervalIndex, timeRanges, onIntervalChange])

  const formatTime = (t) => {
    if (!t || typeof t !== 'string') return ''
    return t.slice(0, 5).replace(':', '.')
  }

  const getIntervalLabel = (tr) => {
    return `${formatTime(tr.start_time)}-${formatTime(tr.end_time)}`
  }

  // Sort time ranges chronologically
  const sortedTimeRanges = React.useMemo(() => {
    if (!timeRanges || timeRanges.length === 0) return []
    
    return [...timeRanges].sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0
      return a.start_time.localeCompare(b.start_time)
    })
  }, [timeRanges])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: theme.palette.text.secondary }]}>
          {t('map.loading')}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Section Selector */}
      <View>
        <Text style={[styles.label, { color: theme.palette.text.secondary }]}>{t('map.section')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {sections.map((section) => {
            const active = selectedSectionId === section.id
            return (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.chip, 
                  { 
                    backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  }
                ]}
                onPress={() => onSectionChange?.(section.id, section.floor_id)}
              >
                <Text style={[
                  styles.chipText,
                  { color: active ? theme.palette.primary.contrastText : theme.palette.text.primary }
                ]}>
                  {section.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Interval Selector */}
      <View>
        <Text style={[styles.label, { color: theme.palette.text.secondary }]}>{t('map.time')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <TouchableOpacity
            style={[
              styles.chip,
              { 
                backgroundColor: (selectedIntervalIndex === -1 || selectedIntervalIndex == null) ? theme.palette.primary.main : theme.palette.background.paper,
                borderColor: theme.palette.divider,
              }
            ]}
            onPress={() => onIntervalChange?.(null, -1)}
          >
            <Text style={[
              styles.chipText,
              { color: (selectedIntervalIndex === -1 || selectedIntervalIndex == null) ? theme.palette.primary.contrastText : theme.palette.text.primary }
            ]}>
              {t('map.all')}
            </Text>
          </TouchableOpacity>
          {sortedTimeRanges.map((tr) => {
            const originalIndex = timeRanges.findIndex(original => 
              original.start_time === tr.start_time && original.end_time === tr.end_time
            )
            const active = selectedIntervalIndex === originalIndex
            return (
              <TouchableOpacity
                key={`interval-${originalIndex}`}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  }
                ]}
                onPress={() => onIntervalChange?.(timeRanges[originalIndex], originalIndex)}
              >
                <Text style={[
                  styles.chipText,
                  { color: active ? theme.palette.primary.contrastText : theme.palette.text.primary }
                ]}>
                  {getIntervalLabel(tr)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
})
