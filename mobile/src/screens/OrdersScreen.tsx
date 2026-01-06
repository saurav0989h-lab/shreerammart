import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react-native';
import { useLanguage } from '../providers/LanguageProvider';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme';

export default function OrdersScreen() {
  const { t } = useLanguage();
  
  // Mock order data
  const orders = [
    { id: '1', status: 'delivered', date: '2024-01-15', total: 1250 },
    { id: '2', status: 'in_transit', date: '2024-01-18', total: 890 },
    { id: '3', status: 'processing', date: '2024-01-20', total: 1540 },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return colors.emerald[600];
      case 'in_transit': return colors.orange[600];
      case 'processing': return colors.purple[600];
      default: return colors.gray[600];
    }
  };
  
  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'delivered': return <CheckCircle color={color} size={20} />;
      case 'in_transit': return <Truck color={color} size={20} />;
      case 'processing': return <Clock color={color} size={20} />;
      default: return <Package color={color} size={20} />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'processing': return 'Processing';
      default: return status;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('orders')}</Text>
        <Text style={styles.headerSubtitle}>Track your order history</Text>
      </LinearGradient>
      
      {/* Orders List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.ordersContainer}>
        {orders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.8}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                {getStatusIcon(order.status)}
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>Total: Rs. {order.total}</Text>
              <TouchableOpacity>
                <Text style={styles.viewDetails}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        {orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Package color={colors.gray[400]} size={48} />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Start shopping to see your orders here</Text>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  ordersContainer: {
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
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  orderTotal: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.emerald[600],
  },
  viewDetails: {
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[700],
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
});
