import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, Clock, CheckCircle2, Truck, MapPin, Phone,
  ChevronRight, Search, Filter, Loader2, ShoppingBag,
  CircleDot, Calendar, CreditCard, Trash2, DollarSign, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import OrderTrackingMap from '@/components/tracking/OrderTrackingMap';
import OrderTimeline from '@/components/tracking/OrderTimeline';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800', icon: Truck },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Clock },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-800', icon: DollarSign }
};

export default function OrderTracking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRefundRequest, setShowRefundRequest] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [selectedItemsForRefund, setSelectedItemsForRefund] = useState([]);
  const [showReplacementVerification, setShowReplacementVerification] = useState(false);
  const [replacementVerificationNote, setReplacementVerificationNote] = useState('');
  const [replacementApprovedByUser, setReplacementApprovedByUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('OrderTracking'));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders', user?.email, user?.phone],
    queryFn: async () => {
      if (!user?.email) return [];
      const regularOrders = await base44.entities.Order.filter({ created_by: user.email }, '-created_date');
      
      // Process regular orders - items are already in the order object
      const ordersWithItems = regularOrders.map(order => {
        // Items should already be in the order, but parse if stored as JSON string
        let items = order.items || [];
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error('Error parsing items for order:', order.order_number, e);
            items = [];
          }
        }
        return {
          ...order,
          items: Array.isArray(items) ? items : []
        };
      });
      
      // Also fetch shopping list orders
      const allShoppingLists = await base44.entities.ShoppingList.list();
      const userShoppingLists = allShoppingLists.filter(l =>
        (user.id && l.user_id === user.id) ||
        (user.phone && l.customer_phone === user.phone) ||
        (user.email && l.customer_email === user.email)
      ).filter(l => ['paid', 'out_for_delivery', 'completed', 'cancelled'].includes(l.status)); // Only show placed orders
      
      // Transform shopping lists to match order format with items from list_items
      const shoppingListOrders = userShoppingLists.map(list => {
        // Try to parse list_items if it's a JSON string
        let items = [];
        if (list.list_items) {
          try {
            items = typeof list.list_items === 'string' ? JSON.parse(list.list_items) : list.list_items;
            if (!Array.isArray(items)) items = [];
          } catch (e) {
            console.log('Error parsing list_items:', e);
            items = [];
          }
        }
        
        return {
          id: list.id,
          order_number: `SL-${list.id.substring(0, 8).toUpperCase()}`,
          customer_name: list.customer_name,
          customer_phone: list.customer_phone,
          customer_email: list.customer_email,
          status: list.status,
          payment_method: 'shopping_list',
          payment_status: list.status === 'paid' ? 'pending' : list.status,
          total_amount: list.estimated_total,
          subtotal: list.estimated_total,
          delivery_fee: 0,
          items: items,
          created_date: list.created_date,
          updated_date: list.updated_date,
          is_shopping_list: true,
          shopping_list_text: list.list_text,
          shopping_list_photos: list.list_photos,
          admin_notes: list.admin_notes
        };
      });
      
      // Combine and sort by date
      const allOrders = [...ordersWithItems, ...shoppingListOrders];
      return allOrders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.email
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (order) => {
      setIsCancelling(true);
      
      // Check if order can be cancelled (not already completed or cancelled)
      if (['completed', 'cancelled', 'out_for_delivery'].includes(order.status)) {
        throw new Error('Cannot cancel orders that are out for delivery, completed, or already cancelled');
      }

      // Check if it's a shopping list order
      if (order.is_shopping_list) {
        // Update shopping list status
        await base44.entities.ShoppingList.update(order.id, { 
          status: 'cancelled',
          updated_date: new Date().toISOString()
        });
      } else {
        // Update regular order status
        await base44.entities.Order.update(order.id, { 
          status: 'cancelled',
          updated_date: new Date().toISOString()
        });

        // Process refund
        if (['esewa', 'khalti', 'paypal', 'card', 'upi', 'phonepe', 'fonepay'].includes(order.payment_method)) {
          // For online payments, process automatic refund
          console.log(`Processing refund for ${order.payment_method}: Rs. ${order.total_amount}`);
          
          // Mock refund processing
          await new Promise(r => setTimeout(r, 1000));
          
          // Create refund record
          await base44.entities.Order.update(order.id, {
            refund_status: 'processed',
            refund_amount: order.total_amount,
            refund_date: new Date().toISOString(),
            refund_reason: cancelReason || 'User requested cancellation'
          });
        } else if (order.payment_method === 'credit') {
          // For credit payments, credit back to user account
          const currentUser = await base44.auth.me();
          await base44.auth.updateMe({
            current_credit_balance: (currentUser.current_credit_balance || 0) - order.total_amount
          });
        }
      }

      setIsCancelling(false);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setSelectedOrder(null);
      setCancelReason('');
      toast.success('Order cancelled successfully. Refund will be processed within 5-7 business days.');
    },
    onError: (error) => {
      setIsCancelling(false);
      toast.error(error.message || 'Failed to cancel order');
    }
  });

  const refundRequestMutation = useMutation({
    mutationFn: async (order) => {
      // Calculate refund amount for selected items
      let refundAmount = 0;
      const refundItems = [];
      
      if (selectedItemsForRefund.length > 0) {
        selectedItemsForRefund.forEach(itemIndex => {
          const item = order.items[itemIndex];
          if (item) {
            refundAmount += item.total_price;
            refundItems.push(item.product_name);
          }
        });
      } else {
        // If no items selected, refund full amount
        refundAmount = order.total_amount;
        refundItems.push('Full Order');
      }

      // Update order with refund request
      await base44.entities.Order.update(order.id, {
        refund_request_status: 'pending',
        refund_request_date: new Date().toISOString(),
        refund_request_reason: refundReason,
        refund_requested_amount: refundAmount,
        refund_requested_items: refundItems.join(', '),
        refund_request_by: user.email
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setShowRefundRequest(false);
      setRefundReason('');
      setSelectedItemsForRefund([]);
      toast.success('Refund request submitted! Admin will review it shortly.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit refund request');
    }
  });

  const verifyReplacementMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const newTotal = replacementApprovedByUser 
        ? selectedOrder.replacement_new_total 
        : parseFloat(replacementVerificationNote) || selectedOrder.replacement_new_total;

      await base44.entities.Order.update(orderId, {
        replacement_status: 'verified',
        replacement_verified_by_user: true,
        replacement_verified_date: new Date().toISOString(),
        replacement_final_total: newTotal,
        replacement_user_note: replacementVerificationNote
      });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setShowReplacementVerification(false);
      setReplacementVerificationNote('');
      setReplacementApprovedByUser(false);
      toast.success('Replacement verified! Order updated.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify replacement');
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchSearch = !search || 
      order.order_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">Track and view your order history</p>
          </div>
          <Link to={createPageUrl('Products')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <ShoppingBag className="w-4 h-4 mr-2" /> Shop Now
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {ordersLoading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {orders.length === 0 
                ? 'Start shopping to see your orders here'
                : 'Try adjusting your search or filter'
              }
            </p>
            <Link to={createPageUrl('Products')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${status.color} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                          <Badge className={status.color}>{status.label}</Badge>
                          {order.is_shopping_list && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">📋 Shopping List</Badge>
                          )}
                          {order.is_international_order && (
                            <Badge variant="outline" className="text-xs">🎁 Gift</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(order.created_date), 'MMM d, yyyy')}
                          </span>
                          <span>{order.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">Rs. {order.total_amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {order.payment_method?.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {order.status === 'out_for_delivery' && (
                    <div className="mt-4 p-3 bg-cyan-50 rounded-lg flex items-center gap-3">
                      <Truck className="w-5 h-5 text-cyan-600 animate-pulse" />
                      <span className="text-sm text-cyan-700 font-medium">
                        Your order is on the way! Click to track live location.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order {selectedOrder.order_number}
                  <Badge className={statusConfig[selectedOrder.status]?.color}>
                    {statusConfig[selectedOrder.status]?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Shopping List Info */}
                {selectedOrder.is_shopping_list && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">📋 Shopping List Order</p>
                    {selectedOrder.shopping_list_text && (
                      <div className="bg-white rounded-lg p-3 mb-2 text-sm whitespace-pre-wrap text-gray-700">
                        {selectedOrder.shopping_list_text}
                      </div>
                    )}
                    {selectedOrder.shopping_list_photos?.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {selectedOrder.shopping_list_photos.map((photo, idx) => (
                          <img key={idx} src={photo} alt={`Item ${idx}`} className="h-16 w-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    {selectedOrder.admin_notes && (
                      <p className="text-xs text-blue-700 mt-2">Admin Notes: {selectedOrder.admin_notes}</p>
                    )}
                  </div>
                )}
                {/* Live Tracking Map for Out for Delivery */}
                {selectedOrder.status === 'out_for_delivery' && (
                  <OrderTrackingMap order={selectedOrder} />
                )}

                {/* Order Timeline */}
                <OrderTimeline order={selectedOrder} />

                {/* Delivery Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    {selectedOrder.delivery_method === 'home_delivery' ? (
                      <>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p>{selectedOrder.address_area}, Ward {selectedOrder.address_ward}</p>
                            <p>{selectedOrder.address_municipality}</p>
                            {selectedOrder.address_landmark && (
                              <p className="text-gray-500">Near: {selectedOrder.address_landmark}</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>Pickup from: {selectedOrder.pickup_location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Qty: {item.quantity || 0} × Rs. {(item.unit_price || item.price || 0)?.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 ml-4">
                            Rs. {(item.total_price || ((item.quantity || 0) * (item.unit_price || item.price || 0)))?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 border rounded-lg bg-gray-50">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No items in this order</p>
                      {selectedOrder.items ? (
                        <p className="text-xs mt-1">Items data: {JSON.stringify(selectedOrder.items).substring(0, 100)}</p>
                      ) : (
                        <p className="text-xs mt-1">Items field is not available</p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>Rs. {(selectedOrder.subtotal || selectedOrder.total_amount || 0)?.toLocaleString()}</span>
                    </div>
                    {selectedOrder.delivery_fee !== undefined && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery Fee</span>
                        <span>{selectedOrder.delivery_fee === 0 ? 'FREE' : `Rs. ${selectedOrder.delivery_fee}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t text-gray-900">
                      <span>Total</span>
                      <span className="text-emerald-600">Rs. {(selectedOrder.total_amount || 0)?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Regular Order Items - REMOVED DUPLICATE SECTION */}

                {/* Payment Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium capitalize">{selectedOrder.payment_method?.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={
                        selectedOrder.payment_status === 'completed' ? 'text-green-600' : 'text-amber-600'
                      }>{selectedOrder.payment_status || 'pending'}</span>
                    </p>
                  </div>
                </div>

                {/* Refund Info if Cancelled */}
                {selectedOrder.status === 'cancelled' && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <CheckCircle2 className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Order Cancelled</p>
                      <p className="text-sm text-red-700">
                        Refund: Rs. {selectedOrder.refund_amount?.toLocaleString() || selectedOrder.total_amount?.toLocaleString()}
                        {selectedOrder.refund_status === 'processed' && ' - Refund processed'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Processed Refund Info */}
                {selectedOrder.refund_status === 'processed' && selectedOrder.status !== 'cancelled' && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Refund Processed by Admin</p>
                    </div>
                    <div className="space-y-1 text-sm text-green-800">
                      <p className="flex justify-between">
                        <span>Refund Amount:</span>
                        <span className="font-semibold">Rs. {selectedOrder.refund_amount?.toLocaleString()}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Processed Date:</span>
                        <span>{selectedOrder.refund_date ? format(new Date(selectedOrder.refund_date), 'PPP') : 'N/A'}</span>
                      </p>
                      {selectedOrder.refund_reason && (
                        <p className="flex justify-between">
                          <span>Reason:</span>
                          <span>{selectedOrder.refund_reason}</span>
                        </p>
                      )}
                      {selectedOrder.refund_note && (
                        <p className="text-xs italic mt-2">Note: {selectedOrder.refund_note}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Item Replacement Verification Section */}
                {selectedOrder.replacement_status === 'pending_verification' && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <Package className="w-5 h-5 mt-0.5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900">Item Replacement Suggestion</p>
                        <p className="text-xs text-yellow-700 mt-1">Admin has suggested a replacement for out-of-stock items</p>
                      </div>
                    </div>

                    <div className="space-y-3 bg-white rounded-lg p-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Out of Stock Items:</p>
                        <p className="text-sm text-gray-800">{selectedOrder.replacement_items || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Suggested Replacement:</p>
                        <p className="text-sm text-gray-800">{selectedOrder.replacement_suggestion || 'N/A'}</p>
                      </div>
                      <div className="border-t pt-2">
                        <p className="text-xs text-gray-600 font-medium">New Price:</p>
                        <p className="text-lg font-bold text-emerald-700">Rs. {(selectedOrder.replacement_new_total || selectedOrder.total_amount)?.toLocaleString()}</p>
                      </div>
                    </div>

                    {!showReplacementVerification ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowReplacementVerification(true)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Verify & Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowReplacementVerification(true)}
                        >
                          Modify Price
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-700 block mb-1 font-medium">
                            {replacementApprovedByUser ? 'Keep suggested price' : 'Modify the price or add notes'}
                          </label>
                          {!replacementApprovedByUser && (
                            <Input
                              type="number"
                              placeholder={selectedOrder.replacement_new_total?.toString()}
                              value={replacementVerificationNote}
                              onChange={(e) => setReplacementVerificationNote(e.target.value)}
                              min="0"
                            />
                          )}
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={replacementApprovedByUser}
                              onChange={(e) => {
                                setReplacementApprovedByUser(e.target.checked);
                                setReplacementVerificationNote('');
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-700">Accept suggested replacement & price</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => verifyReplacementMutation.mutate({ orderId: selectedOrder.id })}
                            disabled={verifyReplacementMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            {verifyReplacementMutation.isPending ? 'Processing...' : 'Confirm'}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowReplacementVerification(false);
                              setReplacementVerificationNote('');
                              setReplacementApprovedByUser(false);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Replacement Verified Status */}
                {selectedOrder.replacement_status === 'verified' && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Replacement Verified</p>
                    </div>
                    <div className="space-y-1 text-sm text-green-800">
                      <p className="flex justify-between">
                        <span>Final Total:</span>
                        <span className="font-semibold">Rs. {(selectedOrder.replacement_final_total || selectedOrder.total_amount)?.toLocaleString()}</span>
                      </p>
                      <p className="text-xs text-green-700 mt-2">Verified on {format(new Date(selectedOrder.replacement_verified_date), 'PPp')}</p>
                    </div>
                  </div>
                )}

                {/* Refund Request Status */}
                {selectedOrder.refund_request_status && (
                  <div className={`border-2 rounded-lg p-4 ${
                    selectedOrder.refund_request_status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                    selectedOrder.refund_request_status === 'approved' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      <DollarSign className={`w-5 h-5 mt-0.5 ${
                        selectedOrder.refund_request_status === 'pending' ? 'text-yellow-600' :
                        selectedOrder.refund_request_status === 'approved' ? 'text-green-600' :
                        'text-red-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          selectedOrder.refund_request_status === 'pending' ? 'text-yellow-900' :
                          selectedOrder.refund_request_status === 'approved' ? 'text-green-900' :
                          'text-red-900'
                        }`}>
                          Refund Request - {selectedOrder.refund_request_status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="flex justify-between">
                        <span>Requested Amount:</span>
                        <span className="font-semibold">Rs. {selectedOrder.refund_requested_amount?.toLocaleString()}</span>
                      </p>
                      {selectedOrder.refund_requested_items && (
                        <p className="flex justify-between">
                          <span>Items:</span>
                          <span>{selectedOrder.refund_requested_items}</span>
                        </p>
                      )}
                      {selectedOrder.refund_request_reason && (
                        <p className="flex justify-between">
                          <span>Reason:</span>
                          <span>{selectedOrder.refund_request_reason}</span>
                        </p>
                      )}
                      {selectedOrder.refund_request_date && (
                        <p className="text-xs text-gray-600">
                          Requested on: {format(new Date(selectedOrder.refund_request_date), 'PPp')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Request Refund Button */}
                {(selectedOrder.status === 'completed' || selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && 
                  !selectedOrder.refund_request_status && (
                  <Button
                    onClick={() => setShowRefundRequest(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Request Refund for Specific Items
                  </Button>
                )}

                {/* Cancel Order Button */}
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'out_for_delivery' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Tell us why you want to cancel (optional)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      rows="2"
                    />
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order? You will receive a full refund.')) {
                          cancelOrderMutation.mutate(selectedOrder);
                        }
                      }}
                      disabled={isCancelling || cancelOrderMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isCancelling || cancelOrderMutation.isPending ? 'Processing...' : 'Cancel Order & Request Refund'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Request Dialog */}
      <Dialog open={showRefundRequest} onOpenChange={setShowRefundRequest}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Refund for Items</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Select items to refund:</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-3 p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItemsForRefund.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItemsForRefund([...selectedItemsForRefund, idx]);
                            } else {
                              setSelectedItemsForRefund(selectedItemsForRefund.filter(i => i !== idx));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} × Rs. {item.unit_price}</p>
                        </div>
                        <p className="font-semibold text-sm">Rs. {item.total_price?.toLocaleString()}</p>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items to refund</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Reason for refund</label>
                <textarea
                  placeholder="e.g., Item damaged, Out of stock, Quality issue, etc."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  rows="3"
                />
              </div>

              {selectedItemsForRefund.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900">
                    Total Refund Amount: Rs. {
                      selectedItemsForRefund.reduce((sum, idx) => sum + (selectedOrder.items[idx]?.total_price || 0), 0).toLocaleString()
                    }
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowRefundRequest(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => refundRequestMutation.mutate(selectedOrder)}
                  disabled={!refundReason || refundRequestMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {refundRequestMutation.isPending ? 'Submitting...' : 'Submit Refund Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}