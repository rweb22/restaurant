import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

const SkeletonCard = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, style]}>
      {/* Image skeleton */}
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />

      {/* Content skeleton */}
      <View style={styles.content}>
        {/* Title skeleton */}
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        
        {/* Description skeleton */}
        <Animated.View style={[styles.descriptionSkeleton, { opacity }]} />
        <Animated.View style={[styles.descriptionSkeleton, { opacity, width: '60%' }]} />

        {/* Footer skeleton */}
        <View style={styles.footer}>
          <Animated.View style={[styles.priceSkeleton, { opacity }]} />
          <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageSkeleton: {
    width: '100%',
    height: 140,
    backgroundColor: colors.secondary[200],
  },
  content: {
    padding: spacing.md,
  },
  titleSkeleton: {
    height: 18,
    backgroundColor: colors.secondary[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  descriptionSkeleton: {
    height: 14,
    backgroundColor: colors.secondary[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceSkeleton: {
    width: 60,
    height: 20,
    backgroundColor: colors.secondary[200],
    borderRadius: borderRadius.sm,
  },
  buttonSkeleton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary[200],
  },
});

export default SkeletonCard;

