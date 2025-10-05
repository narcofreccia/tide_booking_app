import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { getIcon, getIconSize } from '../../config/icons';
import Config from '../../config/env';

/**
 * SupportModal Component
 * Modal with support information and link to support page
 */
export const SupportModal = ({ visible, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const handleOpenSupport = () => {
    const supportUrl = Config.tideSupportPage || 'https://tide.support';
    Linking.openURL(supportUrl).catch(err => {
      console.error('Failed to open support page:', err);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={getIcon('help')}
              size={getIconSize('xl')}
              color={theme.palette.primary.main}
            />
            <Text style={styles.title}>{t('settings.support.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name={getIcon('close')}
                size={getIconSize('lg')}
                color={theme.palette.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              {t('settings.support.description')}
            </Text>

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons
                  name={getIcon('email')}
                  size={getIconSize('md')}
                  color={theme.palette.primary.main}
                />
                <Text style={styles.infoText}>{t('settings.support.emailInfo')}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons
                  name={getIcon('clock')}
                  size={getIconSize('md')}
                  color={theme.palette.primary.main}
                />
                <Text style={styles.infoText}>{t('settings.support.hoursInfo')}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.supportButton} onPress={handleOpenSupport}>
              <MaterialCommunityIcons
                name="open-in-new"
                size={getIconSize('md')}
                color="#FFFFFF"
              />
              <Text style={styles.supportButtonText}>
                {t('settings.support.openSupportPage')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.palette.background.backdrop || 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
    gap: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
  },
  infoSection: {
    backgroundColor: theme.palette.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.text.primary,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  supportButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.palette.primary.contrastText,
  },
});
