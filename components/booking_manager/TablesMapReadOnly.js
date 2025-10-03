import React from 'react'
import { View, StyleSheet, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import Svg, { Rect, Circle, Line, G, Text as SvgText, Path } from 'react-native-svg'
import { useTheme } from '../../theme'
import { getBookingStatusColor } from '../../constants/bookingStatusColors'

/**
 * TablesMapReadOnly
 * Read-only SVG canvas for displaying tables with booking overlays
 * Props:
 * - floor: Floor object with width, height, style
 * - tables: Array of table objects
 * - bookingsByTable: Object mapping table_id to array of bookings
 * - onTablePress: (tableId, bookings) => void - Called when table is clicked
 */
export const TablesMapReadOnly = ({ floor, tables = [], bookingsByTable = {}, onTablePress, selectedTableId }) => {
  const theme = useTheme()
  const [containerWidth, setContainerWidth] = React.useState(Dimensions.get('window').width - 48)

  const width = Number(floor?.width) || 800
  const height = Number(floor?.height) || 600
  const bgColor = theme.palette.background.paper
  const snap = Number(floor?.style?.tileSize ?? floor?.style?.gridSize ?? 10) || 10
  const tableFillColor = '#90caf9'

  // Calculate scale to fit container
  const scale = Math.min(1, containerWidth / width)
  const scaledWidth = width * scale
  const scaledHeight = height * scale

  // Contrast helper for text color
  const getContrastColor = (hexcolor) => {
    if (!hexcolor) return '#FFFFFF'
    const h = hexcolor.replace('#', '')
    if (h.length !== 6) return '#FFFFFF'
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const renderGrid = () => {
    const lines = []
    const stroke = theme.palette.divider
    
    for (let i = 0; i <= width; i += snap) {
      lines.push(
        <Line key={`v-${i}`} x1={i} y1={0} x2={i} y2={height} stroke={stroke} strokeWidth={0.5} opacity={0.3} />
      )
    }
    for (let j = 0; j <= height; j += snap) {
      lines.push(
        <Line key={`h-${j}`} x1={0} y1={j} x2={width} y2={j} stroke={stroke} strokeWidth={0.5} opacity={0.3} />
      )
    }
    return lines
  }

  const renderTable = (t) => {
    const x = Number(t.position_x) || snap * 2
    const y = Number(t.position_y) || snap * 2
    const shape = t.shape || 'square'
    const tw = Number(t.width) || snap
    const th = Number(t.height) || snap

    const tableBookings = bookingsByTable[t.id] || []
    const hasBookings = tableBookings.length > 0
    const hasMultipleBookings = tableBookings.length > 1

    // Determine table fill color
    let tableFill = tableFillColor
    let strokeColor = "#424242"
    let strokeWidth = 1
    
    // Check if this table is selected
    const isSelected = selectedTableId === t.id
    
    if (t.enabled === false) {
      tableFill = '#424242' // Blocked
    } else if (t.enabled_online === false) {
      tableFill = '#bdbdbd' // Online blocked
    } else if (hasBookings) {
      tableFill = getBookingStatusColor(tableBookings[0].status)
    }
    
    // Highlight selected table
    if (isSelected) {
      strokeColor = "#ff6b35" // Orange highlight
      strokeWidth = 3
    }

    const textColor = getContrastColor(tableFill)

    return (
      <G key={t.id} onPress={() => onTablePress?.(t.id, tableBookings)}>
        {shape === 'circle' ? (
          <>
            <Circle
              cx={x + tw / 2}
              cy={y + th / 2}
              r={tw / 2}
              fill={tableFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {hasMultipleBookings && (
              <>
                <Path
                  d={`M ${x} ${y + th / 2} A ${tw / 2} ${tw / 2} 0 0 1 ${x + tw} ${y + th / 2} L ${x + tw / 2} ${y + th / 2} Z`}
                  fill={getBookingStatusColor(tableBookings[1].status)}
                  stroke="#424242"
                  strokeWidth={1}
                />
                <Line x1={x} y1={y + th / 2} x2={x + tw} y2={y + th / 2} stroke="#424242" strokeWidth={1} />
              </>
            )}
          </>
        ) : (
          <>
            <Rect
              x={x}
              y={y}
              width={tw}
              height={th}
              rx={2}
              fill={tableFill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {hasMultipleBookings && (
              <>
                <Path
                  d={`M ${x} ${y + th} L ${x + tw} ${y + th} L ${x + tw} ${y} Z`}
                  fill={getBookingStatusColor(tableBookings[1].status)}
                />
                <Line x1={x} y1={y + th} x2={x + tw} y2={y} stroke="#424242" strokeWidth={1} />
              </>
            )}
          </>
        )}
        
        {/* Table labels */}
        {hasBookings ? (
          <>
            {/* Table number and pax */}
            <SvgText
              x={x + tw / 2}
              y={y + th / 2 - 10}
              fontSize="12"
              fontWeight="600"
              fill={textColor}
              textAnchor="middle"
              fontFamily="System"
            >
              {t.number} ({(tableBookings[0].adults || 0) + (tableBookings[0].children || 0)}p)
            </SvgText>
            {/* Arrival time */}
            <SvgText
              x={x + tw / 2}
              y={y + th / 2 + 4}
              fontSize="11"
              fontWeight="500"
              fill={textColor}
              textAnchor="middle"
              fontFamily="System"
            >
              {tableBookings[0].arrival_time?.slice(0, 5) || ''}
            </SvgText>
            {/* Customer name */}
            <SvgText
              x={x + tw / 2}
              y={y + th / 2 + 17}
              fontSize="10"
              fontWeight="400"
              fill={textColor}
              textAnchor="middle"
              fontFamily="System"
            >
              {(tableBookings[0].name || '').length > 10 
                ? (tableBookings[0].name || '').slice(0, 10) + '...' 
                : (tableBookings[0].name || '')}
            </SvgText>
          </>
        ) : (
          <SvgText
            x={x + tw / 2}
            y={y + th / 2 + 4}
            fontSize="12"
            fontWeight="600"
            fill="#212121"
            textAnchor="middle"
            fontFamily="System"
          >
            {t.number} ({t.max_capacity})
          </SvgText>
        )}
      </G>
    )
  }

  if (!floor) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emptyText, { color: theme.palette.text.secondary }]}>
          Seleziona una sezione per visualizzare la mappa
        </Text>
      </View>
    )
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View 
        style={[styles.container, { backgroundColor: bgColor }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Svg width={scaledWidth} height={scaledHeight} viewBox={`0 0 ${width} ${height}`}>
          {/* Background */}
          <Rect x={0} y={0} width={width} height={height} fill={bgColor} />
          
          {/* Grid */}
          {renderGrid()}
          
          {/* Tables */}
          {tables.map(renderTable)}
        </Svg>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: 12,
    borderRadius: 8,
    minWidth: '100%',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
  },
})
