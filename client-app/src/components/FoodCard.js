import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

const FoodCard = ({
  imageUrl,
  name,
  description,
  price,
  originalPrice,
  badge,
  onPress,
  onAddPress,
  style,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const handleAddPress = (e) => {
    e.stopPropagation();
    if (onAddPress) {
      onAddPress();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}

          {/* Price and Add Button */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{price}</Text>
              {originalPrice && originalPrice > price && (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              )}
            </View>

            {onAddPress && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPress}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  originalPrice: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginLeft: spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: 24,
  },
});

export default FoodCard;

