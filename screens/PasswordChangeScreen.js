import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useTranslation } from '../hooks/useTranslation';
import { updatePassword } from '../services/api';
import { passwordChangeSchema } from '../validation/passwordValidation';
import { PasswordField } from '../components/password_change/PasswordField';
import { TideLogo } from '../components/TideLogo';
import { getIcon, getIconSize } from '../config/icons';

export default function PasswordChangeScreen({ onBack }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { currentUser } = useStateContext();
  const dispatch = useDispatchContext();
  const styles = createStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: t('passwordChange.successMessage'),
        },
      });
      reset();
      // Optionally go back after success
      setTimeout(() => {
        onBack?.();
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || t('passwordChange.errorMessage');
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: errorMessage,
        },
      });
    },
  });

  const onSubmit = (data) => {
    updatePasswordMutation.mutate({
      id: currentUser.id,
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons
              name={getIcon('back')}
              size={getIconSize('lg')}
              color={theme.palette.text.primary}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{t('passwordChange.title')}</Text>
            <Text style={styles.subtitle}>{t('passwordChange.subtitle')}</Text>
          </View>
          <TideLogo size={32} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name={getIcon('info')}
            size={getIconSize('lg')}
            color={theme.palette.info.main}
          />
          <Text style={styles.infoText}>{t('passwordChange.infoText')}</Text>
        </View>

        {/* Password Change Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="oldPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordField
                label={t('passwordChange.currentPassword')}
                placeholder={t('passwordChange.currentPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                error={errors.oldPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordField
                label={t('passwordChange.newPassword')}
                placeholder={t('passwordChange.newPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <PasswordField
                label={t('passwordChange.confirmPassword')}
                placeholder={t('passwordChange.confirmPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Password Requirements */}
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>{t('passwordChange.requirements')}</Text>
            <View style={styles.requirement}>
              <MaterialCommunityIcons
                name="check-circle"
                size={getIconSize('sm')}
                color={theme.palette.success.main}
              />
              <Text style={styles.requirementText}>{t('passwordChange.requirement1')}</Text>
            </View>
            <View style={styles.requirement}>
              <MaterialCommunityIcons
                name="check-circle"
                size={getIconSize('sm')}
                color={theme.palette.success.main}
              />
              <Text style={styles.requirementText}>{t('passwordChange.requirement2')}</Text>
            </View>
            <View style={styles.requirement}>
              <MaterialCommunityIcons
                name="check-circle"
                size={getIconSize('sm')}
                color={theme.palette.success.main}
              />
              <Text style={styles.requirementText}>{t('passwordChange.requirement3')}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              updatePasswordMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={updatePasswordMutation.isPending}
          >
            {updatePasswordMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={getIcon('lock')}
                  size={getIconSize('md')}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>{t('passwordChange.submit')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.info.light || theme.palette.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  form: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  requirementsCard: {
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  requirementsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  requirementText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.secondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.primary.contrastText,
  },
  cancelButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
  },
});
