import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';

const BOOKING_STATUSES = [
  { value: 'pending', labelKey: 'bookingStatus.pending', color: '#FFA726' },
  { value: 'confirmed', labelKey: 'bookingStatus.confirmed', color: '#66BB6A' },
  { value: 'seated', labelKey: 'bookingStatus.seated', color: '#42A5F5' },
  { value: 'completed', labelKey: 'bookingStatus.completed', color: '#26A69A' },
  { value: 'cancelled_by_user', labelKey: 'bookingStatus.cancelledByUser', color: '#EF5350' },
  { value: 'cancelled_by_restaurant', labelKey: 'bookingStatus.cancelledByRestaurant', color: '#EC407A' },
  { value: 'no_show', labelKey: 'bookingStatus.noShow', color: '#AB47BC' },
];

export const BookingStatus = ({ name = 'status', label = 'Status' }) => {
  const { control } = useFormContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          const selectedStatus = BOOKING_STATUSES.find(s => s.value === value);
          
          return (
            <>
              <TouchableOpacity
                style={[styles.selector, error && styles.selectorError]}
                onPress={() => setIsOpen(true)}
              >
                {selectedStatus ? (
                  <View style={styles.selectedStatus}>
                    <View style={[styles.statusDot, { backgroundColor: selectedStatus.color }]} />
                    <Text style={styles.selectorText}>{t(selectedStatus.labelKey)}</Text>
                  </View>
                ) : (
                  <Text style={[styles.selectorText, { color: theme.palette.text.hint }]}>
                    {t('bookingStatus.selectStatus')}
                  </Text>
                )}
                <Text style={styles.chevron}>▼</Text>
              </TouchableOpacity>

              {error && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}

              <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
              >
                <TouchableOpacity 
                  style={styles.modalOverlay} 
                  activeOpacity={1}
                  onPress={() => setIsOpen(false)}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{t('bookingStatus.selectStatusTitle')}</Text>
                      <TouchableOpacity onPress={() => setIsOpen(false)}>
                        <Text style={styles.closeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.optionsList}>
                      {BOOKING_STATUSES.map((status) => (
                        <TouchableOpacity
                          key={status.value}
                          style={[
                            styles.option,
                            value === status.value && styles.optionSelected,
                          ]}
                          onPress={() => {
                            onChange(status.value);
                            setIsOpen(false);
                          }}
                        >
                          <View style={styles.optionContent}>
                            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                            <Text style={[
                              styles.optionText,
                              value === status.value && styles.optionTextSelected
                            ]}>
                              {t(status.labelKey)}
                            </Text>
                          </View>
                          {value === status.value && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>
            </>
          );
        }}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.paper,
    borderWidth: 1,
    borderColor: theme.palette.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 48,
  },
  selectorError: {
    borderColor: theme.palette.error.main,
  },
  selectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
    flex: 1,
  },
  chevron: {
    fontSize: 10,
    color: theme.palette.text.secondary,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...theme.shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
  },
  closeButton: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.palette.text.secondary,
    padding: theme.spacing.xs,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  optionSelected: {
    backgroundColor: theme.palette.primary.main + '20',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  optionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.primary,
  },
  optionTextSelected: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  checkmark: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
