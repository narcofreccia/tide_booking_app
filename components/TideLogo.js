import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const TideLogo = ({ size = 32, style }) => {
  return (
    <Image
      source={require('../assets/favicon.png')}
      style={[styles.logo, { width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    // Default styles
  },
});
