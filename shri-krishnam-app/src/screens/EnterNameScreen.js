import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Text, TextInput, Button, Snackbar, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import { colors, spacing, fontSize, borderRadius, shadows } from '../styles/theme';

const EnterNameScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuthStore();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

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
      setError(err.message || 'Failed to save name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Background Gradient */}
        <LinearGradient
          colors={[colors.primary[50], colors.white]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.content}>
          {/* Hero Section with Icon */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon source="account-circle" size={64} color={colors.white} />
              </LinearGradient>
            </View>

            <Text variant="displaySmall" style={styles.title}>
              Welcome! 👋
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Let's get to know you better
            </Text>
          </Animated.View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text variant="labelLarge" style={styles.inputLabel}>
                What should we call you?
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                mode="outlined"
                placeholder="Enter your name"
                autoFocus
                style={styles.input}
                maxLength={255}
                disabled={loading}
                outlineColor={colors.secondary[200]}
                activeOutlineColor={colors.primary[500]}
                left={<TextInput.Icon icon="account" color={colors.primary[500]} />}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSaveName}
              loading={loading}
              disabled={loading || !name.trim()}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor={colors.primary[500]}
              labelStyle={styles.buttonLabel}
            >
              {loading ? 'Saving...' : 'Continue'}
            </Button>

            <View style={styles.helperContainer}>
              <Icon source="information" size={16} color={colors.secondary[400]} />
              <Text variant="bodySmall" style={styles.helperText}>
                This helps us personalize your experience
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
          labelStyle: { color: colors.primary[500] },
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.secondary[900],
  },
  subtitle: {
    color: colors.secondary[600],
    textAlign: 'center',
  },
  formSection: {
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.secondary[700],
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.white,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  helperText: {
    color: colors.secondary[500],
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

export default EnterNameScreen;

