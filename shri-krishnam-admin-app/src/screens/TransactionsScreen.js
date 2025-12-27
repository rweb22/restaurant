import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Chip,
  Searchbar,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getAllTransactions } from '../services/transactionService';

const TransactionsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch transactions
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', statusFilter],
    queryFn: () => getAllTransactions({ status: statusFilter !== 'all' ? statusFilter : undefined })
  });

  const getStatusColor = (status) => {
    const colors = {
      created: '#9E9E9E',
      authorized: '#2196F3',
      captured: '#4CAF50',
      failed: '#F44336',
      refunded: '#FF9800'
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    const labels = {
      created: 'Created',
      authorized: 'Authorized',
      captured: 'Captured',
      failed: 'Failed',
      refunded: 'Refunded'
    };
    return labels[status] || status;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      upi: 'cellphone',
      card: 'credit-card',
      netbanking: 'bank',
      wallet: 'wallet'
    };
    return icons[method] || 'cash';
  };

  const filteredTransactions = data?.data?.transactions?.filter(transaction => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.gatewayOrderId?.toLowerCase().includes(searchLower) ||
      transaction.gatewayPaymentId?.toLowerCase().includes(searchLower) ||
      transaction.order?.user?.name?.toLowerCase().includes(searchLower) ||
      transaction.order?.user?.phone?.includes(searchQuery) ||
      transaction.order?.id?.toString().includes(searchQuery)
    );
  }) || [];

  const renderTransaction = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium">₹{parseFloat(item.amount).toFixed(2)}</Text>
            <Chip
              icon="circle"
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusChipText}
              compact
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
          {item.paymentMethod && (
            <Chip icon={getPaymentMethodIcon(item.paymentMethod)} compact>
              {item.paymentMethod.toUpperCase()}
            </Chip>
          )}
        </View>

        <View style={styles.details}>
          <Text variant="bodySmall" style={styles.label}>Order ID:</Text>
          <Text variant="bodyMedium">#{item.orderId}</Text>
        </View>

        {item.order?.user && (
          <View style={styles.details}>
            <Text variant="bodySmall" style={styles.label}>Customer:</Text>
            <Text variant="bodyMedium">
              {item.order.user.name} ({item.order.user.phone})
            </Text>
          </View>
        )}

        {item.gatewayPaymentId && (
          <View style={styles.details}>
            <Text variant="bodySmall" style={styles.label}>Payment ID:</Text>
            <Text variant="bodySmall" style={styles.monospace}>
              {item.gatewayPaymentId}
            </Text>
          </View>
        )}

        {item.upiVpa && (
          <View style={styles.details}>
            <Text variant="bodySmall" style={styles.label}>UPI VPA:</Text>
            <Text variant="bodySmall">{item.upiVpa}</Text>
          </View>
        )}

        {item.cardLast4 && (
          <View style={styles.details}>
            <Text variant="bodySmall" style={styles.label}>Card:</Text>
            <Text variant="bodySmall">
              {item.cardNetwork} •••• {item.cardLast4}
            </Text>
          </View>
        )}

        {item.status === 'failed' && item.errorDescription && (
          <View style={styles.errorBox}>
            <Text variant="bodySmall" style={styles.errorText}>
              {item.errorDescription}
            </Text>
          </View>
        )}

        <Text variant="bodySmall" style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error loading transactions: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search transactions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <SegmentedButtons
        value={statusFilter}
        onValueChange={setStatusFilter}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'created', label: 'Created' },
          { value: 'authorized', label: 'Auth' },
          { value: 'captured', label: 'Captured' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' }
        ]}
        style={styles.segmentedButtons}
      />

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No transactions found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchbar: {
    margin: 16,
    marginBottom: 8
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 8
  },
  list: {
    padding: 16,
    paddingTop: 8
  },
  card: {
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusChip: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusChipText: {
    color: '#fff',
    lineHeight: 24,
    marginVertical: 0
  },
  details: {
    marginBottom: 4
  },
  label: {
    color: '#666',
    marginBottom: 2
  },
  monospace: {
    fontFamily: 'monospace'
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    marginTop: 8
  },
  errorText: {
    color: '#c62828'
  },
  timestamp: {
    color: '#999',
    marginTop: 8
  },
  empty: {
    padding: 32,
    alignItems: 'center'
  }
});

export default TransactionsScreen;

