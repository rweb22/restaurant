import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text, TextInput, Button, Surface, Snackbar, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import { colors, spacing, fontSize } from '../styles/theme';
import { APP_CONFIG } from '../constants/config';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setTempPhone, setTempSecret } = useAuthStore();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const response = await authService.sendOTP(formattedPhone);
      setTempPhone(formattedPhone);
      setTempSecret(response.secret);
      navigation.navigate('VerifyOTP');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
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
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.iconContainer}>
                {APP_CONFIG.LOGO_TYPE === 'image' ? (
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon source={APP_CONFIG.LOGO_ICON} size={80} color={colors.white} />
                )}
              </View>
              <Text variant="displayMedium" style={styles.appName}>
                {APP_CONFIG.APP_NAME}
              </Text>
              <Text variant="titleMedium" style={styles.tagline}>
                {APP_CONFIG.TAGLINE}
              </Text>
            </View>

            {/* Form Section */}
            <Surface style={styles.formCard} elevation={4}>
              <Text variant="headlineSmall" style={styles.formTitle}>
                Welcome Back!
              </Text>
              <Text variant="bodyMedium" style={styles.formSubtitle}>
                Sign in to continue
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  mode="outlined"
                  placeholder="Enter your phone number"
                  autoFocus
                  left={<TextInput.Icon icon="phone" color={colors.primary[500]} />}
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
                onPress={handleSendOTP}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                buttonColor={colors.primary[500]}
                labelStyle={styles.buttonLabel}
              >
                Send OTP
              </Button>

              <View style={styles.trustSection}>
                <Icon source="shield-check" size={16} color={colors.secondary[600]} />
                <Text variant="bodySmall" style={styles.trustText}>
                  We'll send you a verification code
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
        style={styles.snackbar}
      >
        {error}
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
    paddingTop: spacing['3xl'],
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    color: colors.text.secondary,
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
  snackbar: {
    backgroundColor: colors.error,
  },
});

export default LoginScreen;

