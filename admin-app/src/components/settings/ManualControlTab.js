import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import restaurantService from '../../services/restaurantService';

export default function ManualControlTab({ settings, onUpdate, showSnackbar }) {
  const { token } = useAuthStore();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Error loading status:', error);
      showSnackbar('Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  const handleManualClose = () => {
    setCloseReason('');
    setModalVisible(true);
  };

  const handleConfirmClose = async () => {
    try {
      setProcessing(true);
      await restaurantService.manualClose(closeReason);
      showSnackbar('Restaurant closed manually');
      setModalVisible(false);
      await loadStatus();
      onUpdate();
    } catch (error) {
      console.error('Error closing restaurant:', error);
      showSnackbar('Failed to close restaurant');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualOpen = async () => {
    try {
      setProcessing(true);
      await restaurantService.manualOpen();
      showSnackbar('Restaurant opened manually');
      await loadStatus();
      onUpdate();
    } catch (error) {
      console.error('Error opening restaurant:', error);
      showSnackbar('Failed to open restaurant');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>Current Status</Text>

          <View style={styles.statusRow}>
            <Text variant="bodyLarge">Restaurant is:</Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                status?.isOpen ? styles.openChip : styles.closedChip
              ]}
              textStyle={styles.statusText}
            >
              {status?.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
            </Chip>
          </View>

          {!status?.isOpen && (
            <Text style={styles.reason}>Reason: {status?.reason}</Text>
          )}

          {settings?.isManuallyClosed && (
            <View style={styles.manualInfo}>
              <Text variant="bodySmall" style={styles.manualText}>
                Manually closed
              </Text>
              {settings.manualClosureReason && (
                <Text variant="bodySmall" style={styles.manualReason}>
                  Reason: {settings.manualClosureReason}
                </Text>
              )}
              {settings.manuallyClosedAt && (
                <Text variant="bodySmall" style={styles.manualTime}>
                  Since: {new Date(settings.manuallyClosedAt).toLocaleString()}
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttons}>
            {settings?.isManuallyClosed ? (
              <Button
                mode="contained"
                onPress={handleManualOpen}
                loading={processing}
                disabled={processing}
                icon="lock-open"
                style={styles.openButton}
              >
                Open Restaurant
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleManualClose}
                loading={processing}
                disabled={processing}
                icon="lock"
                style={styles.closeButton}
              >
                Close Restaurant
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Close Restaurant
          </Text>

          <TextInput
            label="Reason (optional)"
            value={closeReason}
            onChangeText={setCloseReason}
            mode="outlined"
            placeholder="e.g., Emergency, Staff shortage"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setModalVisible(false)} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmClose}
              loading={processing}
              disabled={processing}
            >
              Confirm Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    margin: 16
  },
  title: {
    marginBottom: 16
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  statusChip: {
    paddingHorizontal: 12
  },
  openChip: {
    backgroundColor: '#4caf50'
  },
  closedChip: {
    backgroundColor: '#f44336'
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold'
  },
  reason: {
    marginBottom: 16,
    color: '#666'
  },
  manualInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  manualText: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  manualReason: {
    marginBottom: 4
  },
  manualTime: {
    color: '#666'
  },
  buttons: {
    marginTop: 8
  },
  openButton: {
    backgroundColor: '#4caf50'
  },
  closeButton: {
    backgroundColor: '#f44336'
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8
  },
  modalTitle: {
    marginBottom: 16
  },
  input: {
    marginBottom: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  button: {
    marginRight: 8
  }
});

