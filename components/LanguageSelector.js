import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useStateContext, useDispatchContext } from '../context/ContextProvider';
import { useTranslation } from '../hooks/useTranslation';

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

export const LanguageSelector = () => {
  const theme = useTheme();
  const { language } = useStateContext();
  const dispatch = useDispatchContext();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const styles = createStyles(theme);

  const currentLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === language) || AVAILABLE_LANGUAGES[0];

  const handleLanguageChange = (langCode) => {
    dispatch({ type: 'UPDATE_LANGUAGE', payload: langCode });
    setModalVisible(false);
    
    // Show success alert
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'success',
        message: t('settings.languageChanged'),
      },
    });
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible(true)}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="translate" 
              size={24} 
              color={theme.palette.text.secondary} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('settings.language')}</Text>
            <Text style={styles.subtitle}>{currentLanguage.nativeName}</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.languageCode}>{currentLanguage.code.toUpperCase()}</Text>
          </View>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={theme.palette.text.disabled} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={theme.palette.text.primary} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    language === lang.code && styles.languageItemSelected
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <View style={styles.languageCodeBadge}>
                    <Text style={[
                      styles.languageCodeText,
                      language === lang.code && styles.languageCodeTextSelected
                    ]}>
                      {lang.code.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.languageNames}>
                    <Text style={[
                      styles.languageName,
                      language === lang.code && styles.languageNameSelected
                    ]}>
                      {lang.nativeName}
                    </Text>
                    <Text style={styles.languageNameSecondary}>{lang.name}</Text>
                  </View>
                  {language === lang.code && (
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={24} 
                      color={theme.palette.primary.main} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.palette.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
  },
  codeContainer: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.palette.primary.main + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  languageCode: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.primary.main,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.primary,
  },
  languageList: {
    padding: theme.spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.palette.background.default,
  },
  languageItemSelected: {
    backgroundColor: theme.palette.primary.main + '15',
    borderWidth: 1,
    borderColor: theme.palette.primary.main,
  },
  languageCodeBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  languageCodeText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.palette.text.secondary,
    letterSpacing: 0.5,
  },
  languageCodeTextSelected: {
    color: theme.palette.primary.main,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.palette.text.primary,
    marginBottom: 2,
  },
  languageNameSecondary: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.text.secondary,
  },
  languageNameSelected: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
