import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { useStateContext } from '../context/ContextProvider';
import LoadingState from './LoadingState';

export const Loading = () => {
  const { loading } = useStateContext();

  return (
    <Modal
      visible={loading}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <LoadingState size={16} spacing={12} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
