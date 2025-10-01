import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '../services/api';
import bookingSchema from '../validation/bookingValidation';
import { SimpleField } from '../components/SimpleField';
import { NewBookingDatePicker } from '../components/new_booking/NewBookingDatePicker';
import { AvailableTimes } from '../components/new_booking/AvailableTimes';
import { SimplePhoneField } from '../components/new_booking/SimplePhoneField';
import { BookingStatus } from '../components/new_booking/BookingStatus';
import { AccessibilityOptions } from '../components/new_booking/AccessibilityOptions';
import { Pax } from '../components/new_booking/Pax';
import { TideLogo } from '../components/TideLogo';

export default function CreateBookingScreen() {
  const theme = useTheme();
  const { selectedRestaurant } = useStateContext();
  const dispatch = useDispatchContext();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  const defaultValues = useMemo(() => ({
    restaurant_id: selectedRestaurant?.id,
    auto_table_selection: true,
    table_ids: [],
    user_id: null,
    name: '',
    surname: '',
    phone: '',
    email: '',
    arrival_time: '',
    status: 'confirmed',
    reservation_date: new Date(),
    adults: 2,
    children: 0,
    highchair_number: 0,
    wheelchair_number: 0,
    costumer_notes: '',
    restaurant_notes: '',
  }), [selectedRestaurant?.id]);

  const methods = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(bookingSchema),
  });

  const mutation = useMutation({
    mutationFn: (payload) => createBooking(selectedRestaurant?.id, payload),
    onMutate: () => dispatch({ type: 'START_LOADING' }),
    onError: (error) => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: error?.message || 'Error creating booking',
        },
      });
      dispatch({ type: 'END_LOADING' });
    },
    onSuccess: () => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: 'Booking created successfully!',
        },
      });
      dispatch({ type: 'END_LOADING' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      methods.reset(defaultValues);
    },
  });

  const onSubmit = (form) => {
    // Normalize time to HH:mm:ss
    const normalizeTime = (value) => {
      if (!value || typeof value !== 'string') return null;
      if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
      if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
      return null;
    };

    // Format date to YYYY-MM-DD (local timezone)
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const payload = {
      restaurant_id: form.restaurant_id,
      auto_table_selection: form.auto_table_selection ?? true,
      table_ids: Array.isArray(form.table_ids) && form.table_ids.length ? form.table_ids : null,
      user_id: form.user_id || null,
      name: form.name || null,
      surname: form.surname || null,
      phone: form.phone?.trim() || null,
      email: form.email || null,
      arrival_time: normalizeTime(form.arrival_time),
      status: form.status || null,
      reservation_date: formatDate(form.reservation_date),
      adults: Number(form.adults ?? 1),
      children: Number(form.children ?? 0),
      highchair_number: form.highchair_number != null ? Number(form.highchair_number) : 0,
      wheelchair_number: form.wheelchair_number != null ? Number(form.wheelchair_number) : 0,
      costumer_notes: form.costumer_notes || null,
      restaurant_notes: form.restaurant_notes || null,
    };

    mutation.mutate(payload);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Create New Booking</Text>
            <Text style={styles.subtitle}>Fill in the booking details</Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      <FormProvider {...methods}>
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            {/* Date and Time */}
            <NewBookingDatePicker name="reservation_date" label="Date" />
            <AvailableTimes name="arrival_time" label="Arrival Time" />

            {/* Customer Info */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <SimpleField field="name" label="Name" type="text" />
              </View>
              <View style={styles.halfWidth}>
                <SimpleField field="surname" label="Surname" type="text" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <SimplePhoneField name="phone" label="Phone" />
              </View>
              <View style={styles.halfWidth}>
                <SimpleField field="email" label="Email" type="email" />
              </View>
            </View>

            {/* Guest Count */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Guests</Text>
              <Pax />
            </View>

            {/* Accessibility */}
            <AccessibilityOptions collapsed={true} disableCollapse={false} />

            {/* Status */}
            <BookingStatus name="status" label="Status" />

            {/* Notes */}
            <SimpleField 
              field="costumer_notes" 
              label="Customer Notes" 
              multiline 
              rows={4}
              placeholder="Special requests, dietary requirements..."
            />
            
            <SimpleField 
              field="restaurant_notes" 
              label="Restaurant Notes" 
              multiline 
              rows={4}
              placeholder="Internal notes..."
            />

            <TouchableOpacity 
              style={[styles.button, mutation.isPending && styles.buttonDisabled]} 
              onPress={methods.handleSubmit(onSubmit)}
              disabled={mutation.isPending}
            >
              <Text style={styles.buttonText}>
                {mutation.isPending ? 'Creating...' : 'Create Booking'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </FormProvider>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    minHeight: 48,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
