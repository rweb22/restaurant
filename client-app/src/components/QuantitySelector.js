import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

const QuantitySelector = ({
  quantity = 1,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = 'md',
  style,
}) => {
  const canDecrement = quantity > min;
  const canIncrement = quantity < max;

  return (
    <View style={[styles.container, styles[`container_${size}`], style]}>
      <TouchableOpacity
        style={[
          styles.button,
          styles[`button_${size}`],
          !canDecrement && styles.buttonDisabled,
        ]}
        onPress={onDecrement}
        disabled={!canDecrement}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            styles[`buttonText_${size}`],
            !canDecrement && styles.buttonTextDisabled,
          ]}
        >
          −
        </Text>
      </TouchableOpacity>

      <View style={[styles.quantityContainer, styles[`quantityContainer_${size}`]]}>
        <Text style={[styles.quantity, styles[`quantity_${size}`]]}>
          {quantity}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          styles[`button_${size}`],
          !canIncrement && styles.buttonDisabled,
        ]}
        onPress={onIncrement}
        disabled={!canIncrement}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            styles[`buttonText_${size}`],
            !canIncrement && styles.buttonTextDisabled,
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  container_sm: {
    height: 28,
  },
  container_md: {
    height: 36,
  },
  container_lg: {
    height: 44,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  button_sm: {
    width: 28,
    height: 28,
  },
  button_md: {
    width: 36,
    height: 36,
  },
  button_lg: {
    width: 44,
    height: 44,
  },
  buttonDisabled: {
    backgroundColor: colors.secondary[300],
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    lineHeight: 20,
  },
  buttonText_sm: {
    fontSize: fontSize.base,
  },
  buttonText_md: {
    fontSize: fontSize.lg,
  },
  buttonText_lg: {
    fontSize: fontSize.xl,
  },
  buttonTextDisabled: {
    color: colors.text.disabled,
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityContainer_sm: {
    minWidth: 32,
    paddingHorizontal: spacing.xs,
  },
  quantityContainer_md: {
    minWidth: 40,
    paddingHorizontal: spacing.sm,
  },
  quantityContainer_lg: {
    minWidth: 48,
    paddingHorizontal: spacing.md,
  },
  quantity: {
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  quantity_sm: {
    fontSize: fontSize.sm,
  },
  quantity_md: {
    fontSize: fontSize.base,
  },
  quantity_lg: {
    fontSize: fontSize.lg,
  },
});

export default QuantitySelector;

