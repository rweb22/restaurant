import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Snackbar, Icon, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import pushNotificationService from '../services/pushNotificationService';
import useAuthStore from '../store/authStore';
import { colors, spacing, fontSize } from '../styles/theme';

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

    console.log('[VerifyOTP] Attempting verification with:', {
      phone: tempPhone,
      otp: otp,
      hasSecret: !!tempSecret,
      secretLength: tempSecret?.length
    });

    if (!tempPhone || !tempSecret) {
      setError('Session expired. Please request a new OTP.');
      return;
    }

    setLoading(true);
    try {
      // Try to get push token (non-blocking)
      let pushToken = null;
      try {
        console.log('[VerifyOTP] Attempting to get push token...');
        pushToken = await pushNotificationService.getPushToken();
        if (pushToken) {
          console.log('[VerifyOTP] Push token obtained:', pushToken);
        } else {
          console.log('[VerifyOTP] No push token available (might be Expo Go or permissions denied)');
        }
      } catch (tokenError) {
        console.log('[VerifyOTP] Failed to get push token:', tokenError.message);
        // Continue with login even if push token fails
      }

      // Verify OTP and send push token if available
      const response = await authService.verifyOTP(tempPhone, otp, tempSecret, pushToken);
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
      console.error('[VerifyOTP] Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700], colors.primary[900]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
              <IconButton
                icon="arrow-left"
                iconColor={colors.white}
                size={24}
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              />
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.iconContainer}>
                <Icon source="lock-check" size={64} color={colors.white} />
              </View>
              <Text variant="displaySmall" style={styles.title}>
                Verify OTP
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Enter the code sent to
              </Text>
              <Text variant="titleMedium" style={styles.phoneNumber}>
                {tempPhone}
              </Text>
            </View>

            {/* Form Section */}
            <Surface style={styles.formCard} elevation={4}>
              <View style={styles.inputContainer}>
                <TextInput
                  label="OTP Code"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  mode="outlined"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                  left={<TextInput.Icon icon="shield-key" color={colors.primary[500]} />}
                  style={styles.input}
                  outlineColor={colors.secondary[300]}
                  activeOutlineColor={colors.primary[500]}
                  theme={{
                    roundness: 12,
                  }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleVerifyOTP}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                buttonColor={colors.primary[500]}
                labelStyle={styles.buttonLabel}
              >
                Verify & Continue
              </Button>

              <View style={styles.actionsContainer}>
                <Button
                  mode="text"
                  onPress={handleResendOTP}
                  textColor={colors.primary[600]}
                  labelStyle={styles.textButtonLabel}
                >
                  Resend OTP
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.goBack()}
                  textColor={colors.secondary[600]}
                  labelStyle={styles.textButtonLabel}
                >
                  Change Number
                </Button>
              </View>

              <View style={styles.trustSection}>
                <Icon source="information" size={16} color={colors.secondary[600]} />
                <Text variant="bodySmall" style={styles.trustText}>
                  Code expires in 5 minutes
                </Text>
              </View>
            </Surface>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={3000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  backButtonContainer: {
    marginTop: spacing.md,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  phoneNumber: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.white,
  },
  button: {
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  textButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginLeft: spacing.sm,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  successSnackbar: {
    backgroundColor: colors.success,
  },
});

export default VerifyOTPScreen;

