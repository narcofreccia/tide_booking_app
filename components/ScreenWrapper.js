import React from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../theme'

/**
 * ScreenWrapper
 * Wraps screen content with proper status bar and safe area handling
 * Ensures consistent background colors around notches and navigation bars
 * 
 * Props:
 * - children: React nodes
 * - headerColor: string (optional) - Color for top area, defaults to theme.palette.background.paper
 * - backgroundColor: string (optional) - Color for main content, defaults to theme.palette.background.default
 * - bottomColor: string (optional) - Color for bottom area, defaults to backgroundColor
 */
export const ScreenWrapper = ({ 
  children, 
  headerColor, 
  backgroundColor,
  bottomColor 
}) => {
  const theme = useTheme()
  
  const topColor = headerColor || theme.palette.background.paper
  const mainColor = backgroundColor || theme.palette.background.default
  const btmColor = bottomColor || mainColor

  // Gradient colors - subtle dark gradient starting from header color
  const gradientColors = [
    topColor, // Start with header color at the top
    theme.palette.background.backdrop || '#0A0F1A',
    theme.palette.background.default,
  ]

  return (
    <>
      {/* Status bar configuration */}
      <StatusBar 
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Simple background - no gradient */}
      <View style={[styles.background, { backgroundColor: mainColor }]} />
      
      {/* Main content */}
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
