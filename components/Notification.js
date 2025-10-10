import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';

const { width } = Dimensions.get('window');

const AlertItem = ({ alert, index, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide - longer duration for warnings/errors
    const duration = alert.severity === 'error' || alert.severity === 'warning' ? 8000 : 6000;
    const timer = setTimeout(() => {
      onClose(alert.id);
    }, duration);

    return () => clearTimeout(timer);
  }, []);


  // Get color based on severity
  const getAlertColor = () => {
    switch (alert.severity) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
      default:
        return '#2196f3';
    }
  };

  // Get icon based on severity
  const getAlertIcon = () => {
    switch (alert.severity) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Animated.View
      style={[
        styles.alertContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          top: 60 + (index * 65), // Stack alerts vertically with less spacing
        },
      ]}
    >
      <View style={[styles.alert, { backgroundColor: getAlertColor() }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getAlertIcon()}</Text>
        </View>
        <Text style={styles.message}>{alert.message}</Text>
        <TouchableOpacity onPress={() => onClose(alert.id)} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export const Notification = () => {
  const state = useStateContext();
  const dispatch = useDispatchContext();

  // Use new alerts array, fallback to empty array if undefined
  // Ensure state and alerts exist before accessing
  const alerts = (state && Array.isArray(state.alerts)) ? state.alerts : [];

  const handleClose = (alertId) => {
    dispatch({ type: 'REMOVE_ALERT', payload: alertId });
  };

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <>
      {alerts.map((alert, index) => (
        alert && alert.id ? (
          <AlertItem
            key={alert.id}
            alert={alert}
            index={index}
            onClose={handleClose}
          />
        ) : null
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 99999,
    alignItems: 'center',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: width - 40,
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
