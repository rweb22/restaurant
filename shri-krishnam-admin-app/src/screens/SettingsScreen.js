import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Appbar,
  SegmentedButtons,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import useAuthStore from '../store/authStore';
import restaurantService from '../services/restaurantService';
import GeneralSettingsTab from '../components/settings/GeneralSettingsTab';
import OperatingHoursTab from '../components/settings/OperatingHoursTab';
import HolidaysTab from '../components/settings/HolidaysTab';
import ManualControlTab from '../components/settings/ManualControlTab';

export default function SettingsScreen({ navigation }) {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [operatingHours, setOperatingHours] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, hoursRes, holidaysRes] = await Promise.all([
        restaurantService.getSettings(),
        restaurantService.getOperatingHours(),
        restaurantService.getHolidays()
      ]);

      setSettings(settingsRes.data);
      setOperatingHours(hoursRes.data);
      setHolidays(holidaysRes.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      showSnackbar('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbar({ visible: true, message });
  };

  const hideSnackbar = () => {
    setSnackbar({ visible: false, message: '' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Settings" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        style={styles.tabs}
        buttons={[
          { value: 'general', label: 'General' },
          { value: 'hours', label: 'Hours' },
          { value: 'holidays', label: 'Holidays' },
          { value: 'control', label: 'Control' }
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
        >
        {activeTab === 'general' && (
          <GeneralSettingsTab
            settings={settings}
            onUpdate={loadData}
            showSnackbar={showSnackbar}
          />
        )}
        {activeTab === 'hours' && (
          <OperatingHoursTab
            operatingHours={operatingHours}
            onUpdate={loadData}
            showSnackbar={showSnackbar}
          />
        )}
        {activeTab === 'holidays' && (
          <HolidaysTab
            holidays={holidays}
            onUpdate={loadData}
            showSnackbar={showSnackbar}
          />
        )}
        {activeTab === 'control' && (
          <ManualControlTab
            settings={settings}
            onUpdate={loadData}
            showSnackbar={showSnackbar}
          />
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16
  },
  tabs: {
    margin: 16
  },
  content: {
    flex: 1
  }
});

