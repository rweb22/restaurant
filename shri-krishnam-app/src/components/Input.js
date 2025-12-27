import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.secondary[300], colors.primary[500]],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          isFocused && styles.inputContainerFocused,
          { borderColor: error ? colors.error : borderColor },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.hint}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  inputContainerFocused: {
    ...shadows.md,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  leftIcon: {
    marginLeft: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;

