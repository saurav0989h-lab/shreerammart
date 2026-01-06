import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '../../api/base44Client';
import { colors, gradients } from '../../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../theme';

export default function AdminOrdersScreen() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders-mobile'],
    queryFn: () => base44.entities.Order.list(),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return colors.emerald[600];
      case 'cancelled': return colors.red[600];
      case 'processing': return colors.purple[600];
      default: return colors.gray[600];
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'delivered': return <CheckCircle color={color} size={18} />;
      case 'cancelled': return <XCircle color={color} size={18} />;
      case 'processing': return <Clock color={color} size={18} />;
      default: return <Package color={color} size={18} />;
    }
  };

  const renderOrderItem = ({ item: order }: { item: any }) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.8}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
          {getStatusIcon(order.status)}
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>{order.customer?.full_name || 'Guest'}</Text>
        <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Rs. {order.total_price || 0}</Text>
        <Text style={styles.viewLink}>Manage →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Admin Orders</Text>
        <Text style={styles.headerSubtitle}>Manage customer orders</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.purple[600]} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package color={colors.gray[400]} size={48} />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.md,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: colors.white,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: spacing.md,
  },
  customerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  orderTotal: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.emerald[600],
  },
  viewLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.purple[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.gray[500],
    marginTop: spacing.md,
  },
});
