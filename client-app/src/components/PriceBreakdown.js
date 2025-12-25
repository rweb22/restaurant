import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

const PriceBreakdown = ({
  items = [],
  subtotal,
  deliveryFee = 0,
  tax = 0,
  discount = 0,
  total,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Items */}
      {items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                {item.variant && (
                  <Text style={styles.itemVariant}>{item.variant}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Price Breakdown */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>₹{subtotal}</Text>
        </View>

        {deliveryFee > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee</Text>
            <Text style={styles.value}>₹{deliveryFee}</Text>
          </View>
        )}

        {tax > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Tax & Fees</Text>
            <Text style={styles.value}>₹{tax}</Text>
          </View>
        )}

        {discount > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, styles.discountLabel]}>Discount</Text>
            <Text style={[styles.value, styles.discountValue]}>-₹{discount}</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  itemVariant: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  discountLabel: {
    color: colors.success,
  },
  discountValue: {
    color: colors.success,
    fontWeight: fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondary[200],
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.primary[700],
  },
});

export default PriceBreakdown;

