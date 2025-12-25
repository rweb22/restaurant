import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

const CategoryChip = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.chip,
          selected ? styles.chipSelected : styles.chipUnselected,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.label,
            selected ? styles.labelSelected : styles.labelUnselected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius['2xl'],
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary[500],
    ...shadows.md,
  },
  chipUnselected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary[300],
    ...shadows.sm,
  },
  icon: {
    fontSize: fontSize.lg,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  labelSelected: {
    color: colors.white,
  },
  labelUnselected: {
    color: colors.text.primary,
  },
});

export default CategoryChip;

