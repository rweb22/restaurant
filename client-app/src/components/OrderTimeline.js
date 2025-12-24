import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';

const OrderTimeline = ({ status, paymentStatus }) => {
  // Define the timeline steps
  const timelineSteps = [
    {
      key: 'pending_payment',
      label: 'Payment Pending',
      icon: '💳',
      description: 'Awaiting payment',
    },
    {
      key: 'pending',
      label: 'Order Placed',
      icon: '📝',
      description: 'Awaiting confirmation',
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      icon: '✅',
      description: 'Order confirmed',
    },
    {
      key: 'preparing',
      label: 'Preparing',
      icon: '👨‍🍳',
      description: 'Food is being prepared',
    },
    {
      key: 'ready',
      label: 'Ready',
      icon: '🔔',
      description: 'Ready for delivery',
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: '🎉',
      description: 'Order delivered',
    },
  ];

  // Handle cancelled status
  if (status === 'cancelled') {
    return (
      <Surface style={styles.container} elevation={0}>
        <Text variant="titleMedium" style={styles.title}>
          Order Status
        </Text>
        <View style={styles.cancelledContainer}>
          <View style={styles.cancelledStep}>
            <View style={[styles.iconContainer, styles.cancelledIcon]}>
              <Text style={styles.icon}>🚫</Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="titleMedium" style={styles.cancelledLabel}>
                Order Cancelled
              </Text>
              <Text variant="bodySmall" style={styles.cancelledDescription}>
                {paymentStatus === 'completed' 
                  ? 'Refund will be processed within 5-7 business days'
                  : 'Your order has been cancelled'}
              </Text>
            </View>
          </View>
        </View>
      </Surface>
    );
  }

  // Find current step index
  const currentStepIndex = timelineSteps.findIndex((step) => step.key === status);

  return (
    <Surface style={styles.container} elevation={0}>
      <Text variant="titleMedium" style={styles.title}>
        Order Timeline
      </Text>

      <View style={styles.timeline}>
        {timelineSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === timelineSteps.length - 1;

          return (
            <View key={step.key} style={styles.timelineStep}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.iconContainer,
                    isCompleted ? styles.completedIcon : styles.pendingIcon,
                    isCurrent && styles.currentIcon,
                  ]}
                >
                  <Text style={styles.icon}>{step.icon}</Text>
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      isCompleted ? styles.completedConnector : styles.pendingConnector,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text
                  variant="titleSmall"
                  style={[
                    styles.stepLabel,
                    isCompleted ? styles.completedLabel : styles.pendingLabel,
                    isCurrent && styles.currentLabel,
                  ]}
                >
                  {step.label}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.stepDescription,
                    isCompleted ? styles.completedDescription : styles.pendingDescription,
                  ]}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#292524',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  completedIcon: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  currentIcon: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
    borderWidth: 3,
  },
  pendingIcon: {
    backgroundColor: '#f5f5f4',
    borderColor: '#d6d3d1',
  },
  cancelledIcon: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  icon: {
    fontSize: 24,
  },
  connector: {
    width: 3,
    flex: 1,
    minHeight: 40,
    marginTop: 4,
  },
  completedConnector: {
    backgroundColor: '#16a34a',
  },
  pendingConnector: {
    backgroundColor: '#e7e5e4',
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  stepLabel: {
    fontWeight: '600',
    marginBottom: 2,
  },
  completedLabel: {
    color: '#16a34a',
  },
  currentLabel: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  pendingLabel: {
    color: '#a8a29e',
  },
  stepDescription: {
    lineHeight: 18,
  },
  completedDescription: {
    color: '#57534e',
  },
  pendingDescription: {
    color: '#a8a29e',
  },
  cancelledContainer: {
    paddingLeft: 4,
  },
  cancelledStep: {
    flexDirection: 'row',
  },
  cancelledLabel: {
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cancelledDescription: {
    color: '#78716c',
  },
});

export default OrderTimeline;

