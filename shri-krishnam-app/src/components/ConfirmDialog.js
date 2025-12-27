import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

const ConfirmDialog = ({ visible, onDismiss, onConfirm, title, message }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            style={styles.confirmButton}
            labelStyle={styles.confirmButtonLabel}
            buttonColor="#FF9800"
          >
            Logout
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1917',
  },
  message: {
    fontSize: 16,
    color: '#57534e',
    lineHeight: 24,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cancelButton: {
    borderColor: '#e7e5e4',
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonLabel: {
    color: '#57534e',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: 8,
    elevation: 0,
  },
  confirmButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmDialog;

