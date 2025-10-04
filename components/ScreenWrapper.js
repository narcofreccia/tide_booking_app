import React from 'react'
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
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
        barStyle="light-content" 
        backgroundColor="transparent"
        translucent
      />
      
      {/* Gradient background - covers entire screen including status bar */}
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Main content */}
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
      
      {/* Bottom background for navigation bar area */}
      <LinearGradient
        colors={[btmColor, theme.palette.background.backdrop || '#0A0F1A']}
        style={styles.bottomBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  gradientBackground: {
    position: 'absolute',
    top: -100, // Extend above to cover status bar area
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: -1,
  },
})
