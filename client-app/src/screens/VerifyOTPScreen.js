import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';

const VerifyOTPScreen = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { tempPhone, tempSecret, login, setTempSecret } = useAuthStore();

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP(tempPhone, otp, tempSecret);
      console.log('[VerifyOTP] Response:', response);
      // Backend returns 'accessToken', not 'token'
      const token = response.accessToken || response.token;
      if (!token) {
        throw new Error('No access token received from server');
      }
      await login(token, response.user);
      console.log('[VerifyOTP] Login successful');
    } catch (err) {
      console.error('[VerifyOTP] Error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authService.sendOTP(tempPhone);
      setTempSecret(response.secret);
      setSuccess('OTP sent successfully');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
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
            <Text variant="displaySmall" style={styles.title}>
              Verify OTP
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Enter the code sent to {tempPhone}
            </Text>
          </View>

          <Surface style={styles.formContainer} elevation={0}>
            <TextInput
              label="OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              mode="outlined"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              autoFocus
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Verify
            </Button>

            <Button
              mode="text"
              onPress={handleResendOTP}
              style={styles.textButton}
            >
              Resend OTP
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.textButton}
            >
              Change Number
            </Button>
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

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
      >
        {success}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf9',
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
    marginBottom: 48,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#78716c',
  },
  formContainer: {
    backgroundColor: 'transparent',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  textButton: {
    marginTop: 8,
  },
});

export default VerifyOTPScreen;

