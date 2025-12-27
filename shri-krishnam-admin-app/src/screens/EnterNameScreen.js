import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

export default function EnterNameScreen() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuthStore();

  const handleSaveName = async () => {
    if (!name || name.trim().length === 0) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.updateProfile({ name: name.trim() });
      
      // Update local user state with the updated user data
      await updateUser(response.user);
      
      // Navigation will happen automatically when user.name is set
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
              Welcome!
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Please tell us your name
            </Text>
          </View>

          <Surface style={styles.formContainer} elevation={2}>
            <TextInput
              label="Your Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              placeholder="Enter your name"
              autoFocus
              style={styles.input}
              maxLength={255}
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleSaveName}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Continue
            </Button>

            <Text variant="bodySmall" style={styles.helperText}>
              This helps us personalize your experience
            </Text>
          </Surface>
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  helperText: {
    textAlign: 'center',
    color: '#666',
  },
});

