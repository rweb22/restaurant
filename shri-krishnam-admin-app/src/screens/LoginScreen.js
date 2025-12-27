import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme, HelperText } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import authService from '../services/authService';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const sendOTPMutation = useMutation({
    mutationFn: authService.sendOTP,
    onSuccess: (data) => {
      // Pass the secret from the response to the VerifyOTP screen
      navigation.navigate('VerifyOTP', {
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
        secret: data.secret
      });
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to send OTP');
    },
  });

  const handleSendOTP = () => {
    setError('');
    
    // Validate phone number
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    sendOTPMutation.mutate(formattedPhone);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface} elevation={2}>
          <View style={styles.header}>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
              Admin Login
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Enter your phone number to receive an OTP
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setError('');
              }}
              keyboardType="phone-pad"
              mode="outlined"
              left={<TextInput.Affix text="+91" />}
              error={!!error}
              disabled={sendOTPMutation.isPending}
              style={styles.input}
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSendOTP}
              loading={sendOTPMutation.isPending}
              disabled={sendOTPMutation.isPending}
              style={styles.button}
            >
              Send OTP
            </Button>

            <Text variant="bodySmall" style={styles.note}>
              Note: Only admin accounts can access this app
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    gap: 8,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  note: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.6,
  },
});

