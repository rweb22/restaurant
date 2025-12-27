import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme, HelperText } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

export default function VerifyOTPScreen({ route, navigation }) {
  const theme = useTheme();
  const { phone, secret } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const verifyOTPMutation = useMutation({
    mutationFn: ({ phone, otp, secret }) => authService.verifyOTP(phone, otp, secret),
    onSuccess: async (data) => {
      try {
        console.log('Verify OTP response:', data);

        // Check if user is admin
        if (data.user.role !== 'admin') {
          setError('Access denied. Only admin users can access this app.');
          return;
        }

        // Backend returns 'accessToken', not 'token'
        await setAuth(data.user, data.accessToken);
        // Navigation will be handled by App.js based on auth state
      } catch (error) {
        console.error('Error in onSuccess:', error);
        setError(error.message || 'Failed to save authentication');
      }
    },
    onError: (error) => {
      console.error('Verify OTP error:', error);
      setError(error.response?.data?.message || 'Invalid OTP');
    },
  });

  const handleVerifyOTP = () => {
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    verifyOTPMutation.mutate({ phone, otp, secret });
  };

  const handleResendOTP = () => {
    navigation.goBack();
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
              Verify OTP
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Enter the 6-digit code sent to
            </Text>
            <Text variant="bodyLarge" style={[styles.phone, { color: theme.colors.primary }]}>
              {phone}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="OTP"
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                setError('');
              }}
              keyboardType="number-pad"
              mode="outlined"
              maxLength={6}
              error={!!error}
              disabled={verifyOTPMutation.isPending}
              style={styles.input}
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              loading={verifyOTPMutation.isPending}
              disabled={verifyOTPMutation.isPending}
              style={styles.button}
            >
              Verify OTP
            </Button>

            <Button
              mode="text"
              onPress={handleResendOTP}
              disabled={verifyOTPMutation.isPending}
              style={styles.resendButton}
            >
              Resend OTP
            </Button>

            <Text variant="bodySmall" style={styles.note}>
              Development mode: Use OTP 123456
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
  phone: {
    fontWeight: 'bold',
    marginTop: 4,
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
  resendButton: {
    marginTop: 8,
  },
  note: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.6,
  },
});

