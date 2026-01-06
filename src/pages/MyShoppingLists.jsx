import { useState, useCallback , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Image, Clock, CheckCircle, Loader2, Truck, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  sent_to_checkout: 'bg-blue-100 text-blue-800',
  paid: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function MyShoppingLists() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      if (userData) {
        setUser(userData);
      } else {
        navigate(createPageUrl('Login'));
      }
    };
    loadUser();
  }, [navigate]);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['my-shopping-lists', user?.phone, user?.email],
    queryFn: async () => {
      if (!user) return [];
      // Fetch all and filter client-side for flexibility (mock DB limitation)
      const allLists = await base44.entities.ShoppingList.list();
      return allLists.filter(l =>
        (user.id && l.user_id === user.id) ||
        (user.phone && l.customer_phone === user.phone) ||
        (user.email && l.customer_email === user.email)
      );
    },
    enabled: !!user,
  });



  // Remove unused updateListMutation - replaced by specific mutations below

  const cancelListMutation = useMutation({
    mutationFn: async (list) => {
      // Update shopping list status
      await base44.entities.ShoppingList.update(list.id, {
        status: 'cancelled',
        updated_date: new Date().toISOString()
      });

      // If there's an associated order, update it too
      if (list.order_id) {
        await base44.entities.Order.update(list.order_id, {
          status: 'cancelled',
          refund_status: 'processed',
          refund_amount: list.estimated_total,
          refund_date: new Date().toISOString()
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shopping-lists'] });
      toast.success('Shopping list cancelled. Refund will be processed within 5-7 business days.');
    },
    onError: (error) => {
      toast.error('Failed to cancel: ' + error.message);
    }
  });

  const handleProceedToCheckout = useCallback((list) => {
    if (!list) return;

    // Parse list_items if it's a JSON string
    let listItems = [];
    if (list.list_items) {
      try {
        listItems = typeof list.list_items === 'string' ? JSON.parse(list.list_items) : list.list_items;
      } catch (e) {
        console.error('Error parsing list_items:', e);
        listItems = [];
      }
    }

    // Store for checkout pre-fill (don't add to cart, shopping list is separate)
    sessionStorage.setItem('shoppingListCheckout', JSON.stringify({
      listId: list.id,
      customerName: user?.full_name || '',
      customerPhone: user?.phone || list.customer_phone || '',
      customerEmail: user?.email || '',
      estimatedTotal: list.estimated_total,
      listText: list.list_text,
      listPhotos: list.list_photos,
      listItems: listItems,
      adminNotes: list.admin_notes
    }));

    toast.success('Proceeding to checkout!');
    navigate(createPageUrl('Checkout'));
  }, [user, navigate]);

  // Auto-show ready list notification and auto-checkout if sent to checkout
  useEffect(() => {
    if (lists.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const listIdFromUrl = urlParams.get('listId');

    const sentToCheckoutLists = lists.filter(l => l.status === 'sent_to_checkout' && !l.order_id);
    const readyLists = lists.filter(l => (l.status === 'ready' || l.status === 'sent_to_checkout') && !l.order_id);

    if (sentToCheckoutLists.length > 0) {
      toast.success(`💳 Your order is ready for checkout! Total: Rs. ${sentToCheckoutLists[0].estimated_total?.toLocaleString()}`, {
        duration: 8000,
        action: {
          label: 'Checkout Now',
          onClick: () => {
            handleProceedToCheckout(sentToCheckoutLists[0]);
          }
        }
      });
    } else if (readyLists.length > 0) {
      toast.success(`🎉 You have ${readyLists.length} shopping list(s) ready!`, {
        duration: 5000,
      });
    }

    // Auto-checkout if list ID in URL
    if (listIdFromUrl) {
      const targetList = lists.find(l => l.id === listIdFromUrl);
      if (targetList && (targetList.status === 'ready' || targetList.status === 'sent_to_checkout')) {
        setTimeout(() => {
          handleProceedToCheckout(targetList);
        }, 500);
      }
    }
  }, [lists, handleProceedToCheckout]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Shopping Lists</h1>

        {/* User Info (Replaces Search) */}
        {user && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Welcome, {user.first_name || user.full_name}</h2>
              <p className="text-sm text-gray-500">Showing lists linked to {user.phone || user.email}</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              {lists.length} List{lists.length !== 1 ? 's' : ''} Found
            </div>
          </div>
        )}

        {/* Lists */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {!isLoading && user && lists.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No shopping lists found for your account.</p>
          </div>
        )}

        <div className="grid gap-4">
          {lists.map(list => (
            <div key={list.id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className={statusColors[list.status]}>
                    {list.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted on {new Date(list.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {list.list_text && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Your List:</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {list.list_text}
                  </p>
                </div>
              )}

              {list.list_photos?.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Photos:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {list.list_photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`List ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {(list.status === 'ready' || list.status === 'sent_to_checkout') && (
                <div className={`bg-gradient-to-r ${list.status === 'sent_to_checkout' ? 'from-blue-50 to-indigo-50 border-blue-400' : 'from-green-50 to-emerald-50 border-green-300'} border-2 rounded-xl p-5 mb-4 shadow-md ${list.status === 'sent_to_checkout' ? 'animate-pulse' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`${list.status === 'sent_to_checkout' ? 'bg-blue-600' : 'bg-green-600'} rounded-full p-2`}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${list.status === 'sent_to_checkout' ? 'text-blue-900' : 'text-green-900'} text-lg mb-1`}>
                        {list.status === 'sent_to_checkout' ? '💳 Ready for Checkout!' : '✅ Your Order is Ready!'}
                      </p>
                      <div className={`bg-white border ${list.status === 'sent_to_checkout' ? 'border-blue-200' : 'border-green-200'} rounded-lg p-3 mb-3`}>
                        <p className={`text-2xl font-bold ${list.status === 'sent_to_checkout' ? 'text-blue-700' : 'text-green-700'}`}>
                          Rs. {list.estimated_total?.toLocaleString()}
                        </p>
                        {list.admin_notes && (
                          <p className={`text-sm ${list.status === 'sent_to_checkout' ? 'text-blue-800' : 'text-green-800'} mt-2`}>{list.admin_notes}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleProceedToCheckout(list)}
                        className={`w-full ${list.status === 'sent_to_checkout' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-lg py-6 shadow-lg`}
                        size="lg"
                      >
                        <span className={list.status === 'sent_to_checkout' ? 'animate-pulse' : ''}>💳 Proceed to Checkout Now →</span>
                      </Button>
                      <p className={`text-xs ${list.status === 'sent_to_checkout' ? 'text-blue-700' : 'text-green-700'} mt-2 text-center`}>
                        {list.status === 'sent_to_checkout' ? 'Your order is waiting in checkout' : 'Complete your checkout to confirm delivery'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {list.status === 'sent_to_checkout' && (
                <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg mb-3">
                  ⏰ Sent to checkout at {new Date(list.notified_at || list.updated_date).toLocaleTimeString()}
                </p>
              )}

              {list.status === 'pending' && (
                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                  <Clock className="w-4 h-4 inline mr-1" />
                  We&apos;re reviewing your list. You&apos;ll be notified when it&apos;s ready!
                </p>
              )}

              {list.status === 'paid' && (
                <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                  ✓ Order placed successfully! Your order is being prepared.
                </p>
              )}

              {list.status === 'out_for_delivery' && (
                <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900">Out for Delivery</p>
                      <p className="text-sm text-purple-700">Your order is on the way!</p>
                    </div>
                  </div>
                </div>
              )}

              {list.status === 'completed' && (
                <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-900">Order Completed</p>
                      <p className="text-sm text-emerald-700">Thank you for your order!</p>
                    </div>
                  </div>
                </div>
              )}

              {list.status === 'cancelled' && (
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Order Cancelled</p>
                      <p className="text-sm text-red-700">Refund will be processed within 5-7 business days</p>
                    </div>
                  </div>
                </div>
              )}

              {(list.status === 'paid' || list.status === 'pending' || list.status === 'ready') && !['out_for_delivery', 'completed', 'cancelled'].includes(list.status) && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order? You will receive a full refund.')) {
                      cancelListMutation.mutate(list);
                    }
                  }}
                  disabled={cancelListMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {cancelListMutation.isPending ? 'Cancelling...' : 'Cancel Order & Request Refund'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}