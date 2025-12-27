import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, List, Switch, Button, Portal, Modal, TextInput } from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import restaurantService from '../../services/restaurantService';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function OperatingHoursTab({ operatingHours, onUpdate, showSnackbar }) {
  const { token } = useAuthStore();
  const [editingDay, setEditingDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  const getDayHours = (dayOfWeek) => {
    return operatingHours.filter(h => h.dayOfWeek === dayOfWeek);
  };

  const handleEditDay = (dayOfWeek) => {
    const hours = getDayHours(dayOfWeek);
    if (hours.length > 0) {
      setOpenTime(hours[0].openTime.substring(0, 5)); // HH:MM
      setCloseTime(hours[0].closeTime.substring(0, 5)); // HH:MM
      setIsClosed(hours[0].isClosed);
    } else {
      setOpenTime('09:00');
      setCloseTime('22:00');
      setIsClosed(false);
    }
    setEditingDay(dayOfWeek);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const slots = isClosed ? [] : [{
        openTime: `${openTime}:00`,
        closeTime: `${closeTime}:00`,
        isClosed: false
      }];

      await restaurantService.updateOperatingHoursForDay(editingDay, slots);
      showSnackbar('Operating hours updated');
      setModalVisible(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating hours:', error);
      showSnackbar('Failed to update hours');
    } finally {
      setSaving(false);
    }
  };

  const formatTimeSlot = (hours) => {
    if (hours.length === 0 || hours[0].isClosed) {
      return 'Closed';
    }
    return hours.map(h => 
      `${h.openTime.substring(0, 5)} - ${h.closeTime.substring(0, 5)}`
    ).join(', ');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>Weekly Schedule</Text>
          {DAYS.map((day, index) => {
            const hours = getDayHours(index);
            return (
              <List.Item
                key={index}
                title={day}
                description={formatTimeSlot(hours)}
                right={() => (
                  <Button mode="outlined" onPress={() => handleEditDay(index)}>
                    Edit
                  </Button>
                )}
                style={styles.dayItem}
              />
            );
          })}
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Edit {editingDay !== null ? DAYS[editingDay] : ''}
          </Text>

          <View style={styles.switchRow}>
            <Text>Closed all day</Text>
            <Switch value={isClosed} onValueChange={setIsClosed} />
          </View>

          {!isClosed && (
            <>
              <TextInput
                label="Opening Time (HH:MM)"
                value={openTime}
                onChangeText={setOpenTime}
                mode="outlined"
                placeholder="09:00"
                style={styles.input}
              />

              <TextInput
                label="Closing Time (HH:MM)"
                value={closeTime}
                onChangeText={setCloseTime}
                mode="outlined"
                placeholder="22:00"
                style={styles.input}
              />
            </>
          )}

          <View style={styles.modalButtons}>
            <Button onPress={() => setModalVisible(false)} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>
              Save
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
  card: {
    margin: 16
  },
  title: {
    marginBottom: 16
  },
  dayItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

