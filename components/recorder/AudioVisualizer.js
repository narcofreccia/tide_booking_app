import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme';

/**
 * Audio level visualizer with animated bars
 * @param {Object} props
 * @param {number} props.audioLevel - Audio level (0-100)
 * @param {boolean} props.isRecording - Whether recording is active
 * @param {number} props.barCount - Number of bars to display (default: 5)
 */
export const AudioVisualizer = ({
  audioLevel = 0,
  isRecording = false,
  barCount = 5
}) => {
  const theme = useTheme();
  const barAnimations = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;
  
  useEffect(() => {
    if (isRecording) {
      // Animate bars based on audio level
      const normalizedLevel = Math.max(0.2, Math.min(1, audioLevel / 100));
      
      // Create staggered animation for each bar
      const animations = barAnimations.map((anim, index) => {
        const delay = index * 50;
        const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const targetHeight = normalizedLevel * randomVariation;
        
        return Animated.sequence([
          Animated.delay(delay),
          Animated.spring(anim, {
            toValue: targetHeight,
            friction: 3,
            tension: 40,
            useNativeDriver: false
          })
        ]);
      });
      
      Animated.parallel(animations).start();
    } else {
      // Reset bars when not recording
      const animations = barAnimations.map(anim =>
        Animated.timing(anim, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: false
        })
      );
      
      Animated.parallel(animations).start();
    }
  }, [audioLevel, isRecording]);
  
  // Idle animation when not recording
  useEffect(() => {
    if (!isRecording) {
      const idleAnimations = barAnimations.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: false
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: 1000,
              useNativeDriver: false
            })
          ])
        );
      });
      
      const compositeAnimation = Animated.parallel(idleAnimations);
      compositeAnimation.start();
      
      return () => {
        compositeAnimation.stop();
      };
    }
  }, [isRecording]);
  
  const getBarColor = () => {
    if (!isRecording) return theme.palette.text.disabled;
    if (audioLevel > 70) return theme.palette.error.main;
    if (audioLevel > 40) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };
  
  return (
    <View style={styles.container}>
      {barAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: getBarColor(),
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '100%']
              })
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    gap: 6,
    paddingHorizontal: 20
  },
  bar: {
    flex: 1,
    maxWidth: 8,
    borderRadius: 4,
    minHeight: 8
  }
});
