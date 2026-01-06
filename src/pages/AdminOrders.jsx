import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Menu, Search, Eye, Phone, Banknote, Check, DollarSign, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { sendShipmentUpdateEmail } from '@/components/utils/emailService';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800'
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [selectedRefundItems, setSelectedRefundItems] = useState([]);
  const [replacementSelectedItems, setReplacementSelectedItems] = useState([]);
  const [replacementSuggestion, setReplacementSuggestion] = useState('');
  const [replacementNewTotal, setReplacementNewTotal] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      const userData = await base44.auth.me();
      if (userData.role !== 'admin' && userData.role !== 'subadmin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    };
    checkAuth();
  }, [navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!user
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, order }) => {
      await base44.entities.Order.update(id, { status });
      
      // If this order is linked to a shopping list, update the shopping list status too
      if (order.shopping_list_total > 0 || order.shopping_list_text) {
        // Find the shopping list linked to this order
        const shoppingLists = await base44.entities.ShoppingList.list();
        const linkedList = shoppingLists.find(list => list.order_id === order.id);
        
        if (linkedList) {
          // Map order status to shopping list status
          let listStatus = linkedList.status;
          if (status === 'out_for_delivery') {
            listStatus = 'out_for_delivery';
          } else if (status === 'completed') {
            listStatus = 'completed';
          } else if (status === 'cancelled') {
            listStatus = 'cancelled';
          }
          
          await base44.entities.ShoppingList.update(linkedList.id, { 
            status: listStatus,
            updated_date: new Date().toISOString()
          });
        }
      }
      
      // Send shipment update email
      if (order?.customer_email) {
        sendShipmentUpdateEmail(order, status);
      }
      return { status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shopping-lists'] });
      toast.success(`Order status updated to ${data.status.replace(/_/g, ' ')}`);
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, payment_status }) => {
      await base44.entities.Order.update(id, { payment_status });
      return { payment_status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Payment marked as completed');
    }
  });

  const refundMutation = useMutation({
    mutationFn: async ({ id, order }) => {
      setIsRefunding(true);
      const refundAmt = parseFloat(refundAmount) || order.total_amount;

      // Update order with refund information
      await base44.entities.Order.update(id, {
        refund_status: 'processed',
        refund_amount: refundAmt,
        refund_date: new Date().toISOString(),
        refund_reason: refundReason || 'Admin initiated refund',
        refund_note: `Refunded Rs. ${refundAmt} on ${format(new Date(), 'PPP')}`
      });

      setIsRefunding(false);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setRefundAmount('');
      setRefundReason('');
      setSelectedOrder(null);
      toast.success('Refund processed successfully');
    },
    onError: (error) => {
      setIsRefunding(false);
      toast.error(error.message || 'Failed to process refund');
    }
  });

  const approveRefundRequestMutation = useMutation({
    mutationFn: async ({ id, order, items }) => {
      setIsRefunding(true);
      
      // Calculate refund amount for selected items
      let totalRefundAmount = 0;
      let refundedItems = [];
      
      if (items && items.length > 0) {
        items.forEach(itemIndex => {
          const item = order.items[itemIndex];
          if (item) {
            totalRefundAmount += item.total_price;
            refundedItems.push(item.product_name);
          }
        });
      } else {
        // If no items selected, refund the requested amount
        totalRefundAmount = order.refund_requested_amount;
        refundedItems = order.refund_requested_items?.split(', ') || ['Full Order'];
      }

      // Update order with refund approval
      await base44.entities.Order.update(id, {
        refund_request_status: 'approved',
        refund_status: 'processed',
        refund_amount: totalRefundAmount,
        refund_date: new Date().toISOString(),
        refund_reason: order.refund_request_reason,
        refund_approved_by: user.email,
        refund_approved_date: new Date().toISOString(),
        refund_approved_items: refundedItems.join(', ')
      });

      setIsRefunding(false);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedRefundItems([]);
      setSelectedOrder(null);
      toast.success('Refund request approved and processed!');
    },
    onError: (error) => {
      setIsRefunding(false);
      toast.error(error.message || 'Failed to approve refund');
    }
  });

  const rejectRefundRequestMutation = useMutation({
    mutationFn: async ({ id }) => {
      await base44.entities.Order.update(id, {
        refund_request_status: 'rejected',
        refund_rejected_by: user.email,
        refund_rejected_date: new Date().toISOString(),
        refund_rejection_reason: refundReason
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setRefundReason('');
      setSelectedOrder(null);
      toast.success('Refund request rejected');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject refund');
    }
  });

  const sendReplacementSuggestionMutation = useMutation({
    mutationFn: async ({ id, order }) => {
      const newTotal = parseFloat(replacementNewTotal) || order.total_amount;

      await base44.entities.Order.update(id, {
        replacement_status: 'pending_verification',
        replacement_items: replacementSelectedItems.map(idx => order.items[idx]?.product_name).join(', '),
        replacement_suggestion: replacementSuggestion,
        replacement_new_total: newTotal,
        replacement_requested_by_admin: true,
        replacement_notification_date: new Date().toISOString(),
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setReplacementSelectedItems([]);
      setReplacementSuggestion('');
      setReplacementNewTotal('');
      toast.success('Replacement suggestion sent to customer for verification');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send replacement suggestion');
    }
  });

  const applyReplacementMutation = useMutation({
    mutationFn: async ({ orderId, itemId, replacement }) => {
      // Calculate price adjustment
      const priceDifference = replacement.priceComparison?.difference || 0;
      const oldTotal = selectedOrder.total_amount;
      const newTotal = oldTotal + priceDifference;

      // Update order with replacement applied
      await base44.entities.Order.update(orderId, {
        replacement_status: 'approved_by_admin',
        replacement_applied_date: new Date().toISOString(),
        replacement_item_id: itemId,
        total_amount: newTotal,
        replacement_price_adjustment: priceDifference,
        status: 'confirmed'
      });
      return { success: true, newTotal, priceDifference };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder({
        ...selectedOrder,
        total_amount: data.newTotal,
        status: 'confirmed'
      });
      toast.success(`Replacement applied. ${data.priceDifference > 0 ? 'Additional' : 'Refund'} amount: Rs. ${Math.abs(data.priceDifference).toLocaleString()}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply replacement');
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchSearch = !search ||
      order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone?.includes(search);
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchDelivery = deliveryFilter === 'all' || order.delivery_method === deliveryFilter;
    return matchSearch && matchStatus && matchDelivery;
  });

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const refundedOrders = orders.filter(o => o.status === 'refunded' || o.refund_status === 'processed').length;
  const todayOrders = orders.filter(o => {
    const d = new Date(o.created_date);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const outForDeliveryOrders = orders.filter(o => o.status === 'out_for_delivery').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const pendingRefundRequests = orders.filter(o => o.refund_request_status === 'pending').length;

  // Daily (selected date) metrics
  const isSameDay = (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };
  const selectedDateObj = new Date(selectedDate);
  const completedOnSelectedDate = orders.filter(o => o.status === 'completed' && isSameDay(o.created_date, selectedDateObj)).length;
  const revenueOnSelectedDate = orders
    .filter(o => (o.status === 'completed' || o.payment_status === 'completed') && isSameDay(o.created_date, selectedDateObj))
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const refundedOnSelectedDate = orders
    .filter(o => (o.status === 'refunded' || o.refund_status === 'processed') && o.refund_date && isSameDay(o.refund_date, selectedDateObj))
    .length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingOrders={pendingOrders}
      />

      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b sticky top-0 z-10 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Orders</h1>
          </div>
        </header>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Status Bar */}
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border">
            <div className="flex gap-3 overflow-x-auto">
              <div className="min-w-[140px] bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-blue-700 font-medium">Today</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-800">{todayOrders}</p>
              </div>
              <div className="min-w-[140px] bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-green-700 font-medium">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-800">{completedOrders}</p>
              </div>
              <div className="min-w-[140px] bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-amber-700 font-medium">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-800">{pendingOrders}</p>
              </div>
              <div className="min-w-[140px] bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-cyan-700 font-medium">Out for Delivery</p>
                <p className="text-xl sm:text-2xl font-bold text-cyan-800">{outForDeliveryOrders}</p>
              </div>
              <div className="min-w-[140px] bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-purple-700 font-medium">Preparing</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-800">{preparingOrders}</p>
              </div>
              <div className="min-w-[160px] bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-yellow-800 font-medium">Ask for Refund</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">{pendingRefundRequests}</p>
              </div>
              <div className="min-w-[140px] bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-orange-700 font-medium">Refunded</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-800">{refundedOrders}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <div className="flex-1 min-w-[160px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-40"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 sm:w-40 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="w-36 sm:w-40 h-10">
                <SelectValue placeholder="Delivery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="home_delivery">Home Delivery</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Daily Summary for Selected Date */}
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border">
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[180px] bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-green-700 font-medium">Completed on date</p>
                <p className="text-xl sm:text-2xl font-bold text-green-800">{completedOnSelectedDate}</p>
              </div>
              <div className="min-w-[220px] bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-emerald-700 font-medium">Earnings on date (NPR)</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-800">₨{revenueOnSelectedDate.toLocaleString()}</p>
              </div>
              <div className="min-w-[200px] bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-orange-700 font-medium">Refunded on date</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-800">{refundedOnSelectedDate}</p>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Order</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Customer</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Items</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Amount</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Payment</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Status</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Date</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className={`border-t hover:bg-gray-50 ${order.refund_request_status === 'pending' ? 'bg-yellow-50' : ''}`}>
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            {order.order_number}
                            {order.refund_request_status === 'pending' && (
                              <Badge className="bg-yellow-600 text-xs">Refund Request</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {order.customer_phone}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {order.items?.length || 0} items
                        </td>
                        <td className="py-3 px-4 font-medium">Rs. {order.total_amount?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {order.payment_method?.replace(/_/g, ' ')}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Badge className={`text-xs ${order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                {order.payment_status || 'pending'}
                              </Badge>
                              {(['cod', 'pay_at_pickup', 'upi', 'phonepe', 'fonepay'].includes(order.payment_method)) &&
                                order.payment_status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => updatePaymentMutation.mutate({ id: order.id, payment_status: 'completed' })}
                                    disabled={updatePaymentMutation.isPending}
                                  >
                                    <Banknote className="w-3 h-3 mr-1" />
                                    Verify
                                  </Button>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateMutation.mutate({ id: order.id, status: value, order })}
                          >
                            <SelectTrigger className={`w-36 h-8 text-xs ${statusColors[order.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {format(new Date(order.created_date), 'MMM d, h:mm a')}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order {selectedOrder.order_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.payment_method?.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${selectedOrder.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedOrder.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                        }`}>
                        {selectedOrder.payment_status || 'pending'}
                      </Badge>
                      {(['cod', 'pay_at_pickup', 'upi', 'phonepe', 'fonepay'].includes(selectedOrder.payment_method)) &&
                        selectedOrder.payment_status !== 'completed' && (
                          <Button
                            size="sm"
                            className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                            onClick={() => {
                              updatePaymentMutation.mutate({ id: selectedOrder.id, payment_status: 'completed' });
                              setSelectedOrder({ ...selectedOrder, payment_status: 'completed' });
                            }}
                            disabled={updatePaymentMutation.isPending}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Verify Payment
                          </Button>
                        )}
                    </div>
                    {selectedOrder.payment_screenshot && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">Payment Screenshot</p>
                        <a href={selectedOrder.payment_screenshot} target="_blank" rel="noopener noreferrer">
                          <img
                            src={selectedOrder.payment_screenshot}
                            alt="Payment proof"
                            className="w-full max-w-xs rounded-lg border cursor-pointer hover:opacity-80"
                          />
                        </a>
                      </div>
                    )}
                    {selectedOrder.payment_reference && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Transaction ID: {selectedOrder.payment_reference}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.delivery_method === 'home_delivery' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p>{selectedOrder.address_area}, Ward {selectedOrder.address_ward}</p>
                      <p>{selectedOrder.address_municipality}</p>
                      {selectedOrder.address_landmark && <p className="text-gray-500">Near: {selectedOrder.address_landmark}</p>}
                      {selectedOrder.delivery_date && (
                        <p className="mt-2 text-blue-600">
                          Delivery: {format(new Date(selectedOrder.delivery_date), 'PPP')} - {selectedOrder.delivery_time_slot}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.delivery_method === 'pickup' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
                    <p className="font-medium">{selectedOrder.pickup_location}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Order Items</p>
                  {selectedOrder.shopping_list_text && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-green-600 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <p className="font-bold text-green-900 text-sm">📋 Shopping List Order</p>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700 mb-1">Customer&apos;s List:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-2">{selectedOrder.shopping_list_text}</p>
                        {selectedOrder.shopping_list_photos?.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {selectedOrder.shopping_list_photos.map((photo, idx) => (
                              <img key={idx} src={photo} alt="Shopping list" className="w-full h-24 object-cover rounded border" />
                            ))}
                          </div>
                        )}
                        {selectedOrder.shopping_list_total > 0 && (
                          <p className="text-sm font-bold text-green-900 mt-2">
                            Shopping List Total: Rs. {selectedOrder.shopping_list_total?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedOrder.items?.length > 0 && (
                    <>
                      {selectedOrder.shopping_list_text && (
                        <p className="text-xs text-gray-500 mb-2">+ Additional Cart Items:</p>
                      )}
                      <div className="border rounded-lg divide-y">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="p-3 border-b">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">{item.quantity} × Rs. {item.unit_price}</p>
                          </div>
                          <p className="font-medium ml-4">Rs. {item.total_price?.toLocaleString()}</p>
                        </div>
                        {(() => {
                          let cz = item.customizations;
                          if (!cz && typeof item.customizations === 'string') {
                            try { cz = JSON.parse(item.customizations); } catch { cz = null; }
                          }
                          if (!cz) return null;
                          if (!(cz.cake_message || cz.cake_photo_url)) return null;
                          return (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                              {cz.cake_message && (
                                <p className="text-xs text-amber-900"><span className="font-semibold">Cake Message:</span> {cz.cake_message}</p>
                              )}
                              {cz.cake_photo_url && (
                                <img src={cz.cake_photo_url} alt="Cake" className="mt-2 w-20 h-20 object-cover rounded border border-amber-200" />
                              )}
                            </div>
                          );
                        })()}
                        
                        {/* Check if this item is out of stock or has replacement */}
                        {selectedOrder.replacement_mappings && (
                          <div className="mt-2 space-y-2">
                            {(() => {
                              try {
                                const mappings = typeof selectedOrder.replacement_mappings === 'string' 
                                  ? JSON.parse(selectedOrder.replacement_mappings) 
                                  : selectedOrder.replacement_mappings;
                                const itemMapping = mappings[item.product_id];
                                
                                if (!itemMapping) return null;
                                
                                return (
                                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                    <p className="text-xs font-medium text-amber-700 mb-1">⚠️ Out of Stock - Replacement Available:</p>
                                    <p className="text-sm font-semibold text-gray-800">{itemMapping.replacement?.product_name}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Price: Rs. {itemMapping.replacement?.unit_price?.toLocaleString()}
                                      {itemMapping.priceComparison?.difference !== 0 && (
                                        <span className={itemMapping.priceComparison?.isHigher ? 'text-amber-600' : 'text-green-600'}>
                                          {' '}{itemMapping.priceComparison?.isHigher ? '+' : ''}Rs. {Math.abs(itemMapping.priceComparison?.difference)?.toLocaleString()}
                                        </span>
                                      )}
                                    </p>
                                    <Button
                                      size="sm"
                                      className="mt-2 h-7 bg-emerald-600 hover:bg-emerald-700 text-xs"
                                      onClick={() => {
                                        // Handle replacement confirmation
                                        applyReplacementMutation.mutate({
                                          orderId: selectedOrder.id,
                                          itemId: item.product_id,
                                          replacement: itemMapping
                                        });
                                      }}
                                      disabled={applyReplacementMutation.isPending}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Apply Replacement
                                    </Button>
                                  </div>
                                );
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                        ))}
                      </div>
                    </>
                  )}
                  {!selectedOrder.items?.length && !selectedOrder.shopping_list_text && (
                    <p className="text-sm text-gray-500">No items in this order</p>
                  )}
                  <div className="border-t mt-3 pt-3 space-y-1">
                    {selectedOrder.shopping_list_total > 0 && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Shopping List</span>
                        <span>Rs. {selectedOrder.shopping_list_total?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    {selectedOrder.business_discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Business Discount (10%)</span>
                        <span>- Rs. {selectedOrder.business_discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>Rs. {selectedOrder.delivery_fee || 0}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-emerald-600">Rs. {selectedOrder.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.delivery_note && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Delivery Note</p>
                    <p className="bg-gray-50 rounded-lg p-3 text-sm">{selectedOrder.delivery_note}</p>
                  </div>
                )}

                {/* Refund Request Section */}
                {selectedOrder.refund_request_status && (
                  <div className={`border-t pt-6 ${
                    selectedOrder.refund_request_status === 'pending' ? 'border-yellow-300' :
                    selectedOrder.refund_request_status === 'approved' ? 'border-green-300' :
                    'border-red-300'
                  }`}>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      🔔 Customer Refund Request - {selectedOrder.refund_request_status.toUpperCase()}
                    </h3>
                    
                    <div className={`rounded-lg p-4 mb-4 ${
                      selectedOrder.refund_request_status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                      selectedOrder.refund_request_status === 'approved' ? 'bg-green-50 border border-green-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                          <span className="font-medium">Requested Amount:</span>
                          <span className="font-bold">Rs. {selectedOrder.refund_requested_amount?.toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Items:</span>
                          <span>{selectedOrder.refund_requested_items}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium">Reason:</span>
                          <span>{selectedOrder.refund_request_reason}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Requested on: {format(new Date(selectedOrder.refund_request_date), 'PPp')}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.refund_request_status === 'pending' && (
                      <div className="space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-sm text-yellow-900">Process Refund Request:</h4>
                        
                        <div>
                          <label className="text-sm text-gray-700 block mb-2 font-medium">Select items to refund:</label>
                          <div className="bg-white rounded border space-y-2 p-2 max-h-40 overflow-y-auto">
                            {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                              <label key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedRefundItems.includes(idx)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRefundItems([...selectedRefundItems, idx]);
                                    } else {
                                      setSelectedRefundItems(selectedRefundItems.filter(i => i !== idx));
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <div className="flex-1 text-sm">
                                  <p>{item.product_name}</p>
                                  <p className="text-xs text-gray-500">{item.quantity} × Rs. {item.unit_price}</p>
                                </div>
                                <span className="text-sm font-semibold">Rs. {item.total_price?.toLocaleString()}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {selectedRefundItems.length > 0 && (
                          <div className="bg-white p-2 rounded border border-yellow-300">
                            <p className="text-sm font-semibold">
                              Total Refund: Rs. {
                                selectedRefundItems.reduce((sum, idx) => sum + (selectedOrder.items[idx]?.total_price || 0), 0).toLocaleString()
                              }
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm text-gray-700 block mb-2 font-medium">Admin Notes (Optional)</label>
                          <Input
                            type="text"
                            placeholder="e.g., Item out of stock, Quality issue resolved, etc."
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveRefundRequestMutation.mutate({ 
                              id: selectedOrder.id, 
                              order: selectedOrder,
                              items: selectedRefundItems.length > 0 ? selectedRefundItems : null
                            })}
                            disabled={approveRefundRequestMutation.isPending || isRefunding}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            {approveRefundRequestMutation.isPending ? 'Processing...' : 'Approve & Refund'}
                          </Button>
                          <Button
                            onClick={() => rejectRefundRequestMutation.mutate({ id: selectedOrder.id, order: selectedOrder })}
                            disabled={rejectRefundRequestMutation.isPending}
                            variant="outline"
                            className="flex-1"
                          >
                            Reject Request
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedOrder.refund_request_status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded text-sm text-green-800">
                        <p className="font-semibold">✓ Refund Approved on {format(new Date(selectedOrder.refund_approved_date), 'PPp')}</p>
                        <p>Approved Items: {selectedOrder.refund_approved_items}</p>
                        <p>Processed Amount: Rs. {selectedOrder.refund_amount?.toLocaleString()}</p>
                      </div>
                    )}

                    {selectedOrder.refund_request_status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                        <p className="font-semibold">✗ Refund Rejected</p>
                        <p>Reason: {selectedOrder.refund_rejection_reason || 'No reason provided'}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Refund Section */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Refund Management</h3>
                  {selectedOrder.refund_status === 'processed' ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-900">Refund Processed</p>
                      </div>
                      <div className="space-y-1 text-sm text-green-800">
                        <p>Amount: Rs. {selectedOrder.refund_amount?.toLocaleString()}</p>
                        <p>Date: {format(new Date(selectedOrder.refund_date), 'PPP')}</p>
                        <p>Reason: {selectedOrder.refund_reason}</p>
                        {selectedOrder.refund_note && <p>Note: {selectedOrder.refund_note}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Refund Amount (Rs.)</label>
                        <Input
                          type="number"
                          placeholder={selectedOrder.total_amount?.toString()}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          min="0"
                          max={selectedOrder.total_amount}
                          disabled={isRefunding}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to refund full amount (Rs. {selectedOrder.total_amount?.toLocaleString()})</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">Reason for Refund</label>
                        <Input
                          type="text"
                          placeholder="e.g., Customer request, Wrong item sent, etc."
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          disabled={isRefunding}
                        />
                      </div>
                      <Button
                        onClick={() => refundMutation.mutate({ id: selectedOrder.id, order: selectedOrder })}
                        disabled={isRefunding || refundMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        {isRefunding || refundMutation.isPending ? 'Processing...' : 'Process Refund'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Item Replacement Section */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Item Replacement</h3>

                  {selectedOrder.replacement_status === 'pending_verification' ? (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                      <p className="font-semibold text-yellow-900 mb-2">Waiting for customer verification</p>
                      <p>Suggested Replacement Items: {selectedOrder.replacement_items || '—'}</p>
                      <p>Suggestion Notes: {selectedOrder.replacement_suggestion || '—'}</p>
                      <p>New Total: Rs. {(selectedOrder.replacement_new_total || selectedOrder.total_amount)?.toLocaleString()}</p>
                      <p className="text-xs text-gray-600 mt-2">Sent on {format(new Date(selectedOrder.replacement_notification_date), 'PPp')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700 block mb-2 font-medium">Mark items out of stock & select for replacement</label>
                        <div className="bg-white rounded border space-y-2 p-2 max-h-40 overflow-y-auto">
                          {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={replacementSelectedItems.includes(idx)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setReplacementSelectedItems([...replacementSelectedItems, idx]);
                                  } else {
                                    setReplacementSelectedItems(replacementSelectedItems.filter(i => i !== idx));
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <div className="flex-1 text-sm">
                                <p>{item.product_name}</p>
                                <p className="text-xs text-gray-500">{item.quantity} × Rs. {item.unit_price}</p>
                              </div>
                              <span className="text-sm font-semibold">Rs. {item.total_price?.toLocaleString()}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 block mb-2 font-medium">Suggest replacement (product name or link)</label>
                        <Input
                          type="text"
                          placeholder="e.g., Alternative brand or size; paste product link if available"
                          value={replacementSuggestion}
                          onChange={(e) => setReplacementSuggestion(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 block mb-2 font-medium">Adjusted total (optional)</label>
                        <Input
                          type="number"
                          placeholder={selectedOrder.total_amount?.toString()}
                          value={replacementNewTotal}
                          onChange={(e) => setReplacementNewTotal(e.target.value)}
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current total.</p>
                      </div>

                      <Button
                        onClick={() => sendReplacementSuggestionMutation.mutate({ id: selectedOrder.id, order: selectedOrder })}
                        disabled={sendReplacementSuggestionMutation.isPending}
                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                      >
                        Send Replacement Suggestion for Verification
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}