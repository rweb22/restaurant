import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, IconButton } from 'react-native-paper';
import { colors, spacing, fontSize, borderRadius } from '../styles/theme';

// Web version - shows a message that maps are not available
const MapPicker = ({ visible, onDismiss }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Map Not Available
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>
          <View style={styles.webFallback}>
            <Text variant="bodyLarge" style={styles.webFallbackText}>
              Map picker is only available on mobile devices (iOS/Android).
            </Text>
            <Text variant="bodyMedium" style={styles.webFallbackSubtext}>
              Please enter your address manually or use the mobile app to pick a location on the map.
            </Text>
            <Button mode="contained" onPress={onDismiss} style={{ marginTop: spacing.lg }}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    height: '90%',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary[100],
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  webFallbackText: {
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  webFallbackSubtext: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default MapPicker;

