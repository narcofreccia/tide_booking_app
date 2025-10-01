import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const LoadingState = ({ size = 12, spacing = 12 }) => {
  // Create animated values for each dot
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulse animation for each dot with different delays
    const createPulseAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with staggered delays
    const animation1 = createPulseAnimation(dot1Anim, 0);
    const animation2 = createPulseAnimation(dot2Anim, 200);
    const animation3 = createPulseAnimation(dot3Anim, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  // Interpolate animated values for scale and opacity
  const getDotStyle = (animValue) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1.2],
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
    }),
    width: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [size * 0.8, size * 1.1],
    }),
    height: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [size * 0.8, size * 1.1],
    }),
  });

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { gap: spacing }]}>
        <Animated.View
          style={[
            styles.dot,
            { width: size, height: size },
            getDotStyle(dot1Anim),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { width: size, height: size },
            getDotStyle(dot2Anim),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { width: size, height: size },
            getDotStyle(dot3Anim),
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 50,
    backgroundColor: '#007AFF',
  },
});

export default React.memo(LoadingState);
