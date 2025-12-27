import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyles = [
    styles.base,
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ];

  const getButtonContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[600] : colors.white}
          size={size === 'sm' ? 'small' : 'large'}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={[styles.icon, styles.iconLeft]}>{icon}</View>
        )}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <View style={[styles.icon, styles.iconRight]}>{icon}</View>
        )}
      </View>
    );
  };

  // Primary variant uses gradient
  if (variant === 'primary' && !disabled && !loading) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, buttonStyles]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.9}
          {...props}
        >
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {getButtonContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Other variants use solid colors
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[buttonStyles, styles[variant]]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
        {...props}
      >
        {getButtonContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  // Variant styles
  primary: {
    backgroundColor: colors.primary[600],
    ...shadows.md,
  },
  secondary: {
    backgroundColor: colors.secondary[200],
  },
  success: {
    backgroundColor: colors.success,
    ...shadows.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
    ...shadows.md,
  },
  // Size styles
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  size_md: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  size_lg: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  text_primary: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.text.primary,
  },
  text_success: {
    color: colors.white,
  },
  text_outline: {
    color: colors.primary[600],
  },
  text_ghost: {
    color: colors.primary[600],
  },
  text_danger: {
    color: colors.white,
  },
  textSize_sm: {
    fontSize: fontSize.sm,
  },
  textSize_md: {
    fontSize: fontSize.base,
  },
  textSize_lg: {
    fontSize: fontSize.lg,
  },
});

export default Button;

