import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  List,
  Button,
  Portal,
  Modal,
  TextInput,
  IconButton,
  FAB
} from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import restaurantService from '../../services/restaurantService';

export default function HolidaysTab({ holidays, onUpdate, showSnackbar }) {
  const { token } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    setEditingHoliday(null);
    setName('');
    setDate('');
    setModalVisible(true);
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setName(holiday.name);
    setDate(holiday.date);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingHoliday) {
        await restaurantService.updateHoliday(editingHoliday.id, { name, date });
        showSnackbar('Holiday updated');
      } else {
        await restaurantService.createHoliday({ name, date });
        showSnackbar('Holiday added');
      }
      setModalVisible(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving holiday:', error);
      showSnackbar('Failed to save holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await restaurantService.deleteHoliday(id);
      showSnackbar('Holiday deleted');
      onUpdate();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      showSnackbar('Failed to delete holiday');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>Holiday Calendar</Text>
          {sortedHolidays.length === 0 ? (
            <Text style={styles.emptyText}>No holidays added</Text>
          ) : (
            <View>
              {sortedHolidays.map((item) => (
                <List.Item
                  key={item.id.toString()}
                  title={item.name}
                  description={formatDate(item.date)}
                  right={() => (
                    <View style={styles.actions}>
                      <IconButton icon="pencil" onPress={() => handleEdit(item)} />
                      <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
                    </View>
                  )}
                  style={styles.holidayItem}
                />
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAdd}
        label="Add Holiday"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
          </Text>

          <TextInput
            label="Holiday Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            placeholder="e.g., Christmas"
            style={styles.input}
          />

          <TextInput
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            placeholder="2025-12-25"
            style={styles.input}
          />

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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20
  },
  holidayItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  actions: {
    flexDirection: 'row'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16
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

