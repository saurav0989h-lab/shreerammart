import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/ui/CartContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [shoppingListData, setShoppingListData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Try to get phone from user or URL
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          if (userData.phone_number) {
            setPhoneNumber(userData.phone_number);
          }
        }
      } catch (e) {
        console.log('Not authenticated');
      }
    };
    loadUser();
  }, []);

  // Fetch shopping lists for this user
  const { data: shoppingLists = [] } = useQuery({
    queryKey: ['shopping-lists-cart', phoneNumber],
    queryFn: () => base44.entities.ShoppingList.filter({ customer_phone: phoneNumber }),
    enabled: !!phoneNumber,
  });

  useEffect(() => {
    // Check sessionStorage first
    const shoppingListCheckout = sessionStorage.getItem('shoppingListCheckout');
    if (shoppingListCheckout) {
      setShoppingListData(JSON.parse(shoppingListCheckout));
      return;
    }

    // Auto-load shopping list if sent to checkout
    const sentList = shoppingLists.find(l => l.status === 'sent_to_checkout' && !l.order_id);
    if (sentList) {
      const listData = {
        listId: sentList.id,
        estimatedTotal: sentList.estimated_total,
        adminNotes: sentList.admin_notes,
        listText: sentList.list_text,
        listPhotos: sentList.list_photos,
        customerName: sentList.customer_name,
        customerPhone: sentList.customer_phone,
        customerEmail: sentList.customer_email
      };
      sessionStorage.setItem('shoppingListCheckout', JSON.stringify(listData));
      setShoppingListData(listData);
      toast.success('💳 Your shopping list order is ready in cart!');
    }
  }, [shoppingLists]);

  const shoppingListTotal = shoppingListData ? shoppingListData.estimatedTotal : 0;
  const combinedSubtotal = cartTotal + shoppingListTotal;
  const deliveryFee = combinedSubtotal >= 500 ? 0 : 50;
  const grandTotal = combinedSubtotal + deliveryFee;

  if (cart.length === 0 && !shoppingListData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center">Looks like you haven't added anything to your cart yet</p>
        <Link to={createPageUrl('Products')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <ShoppingBag className="w-4 h-4 mr-2" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm" onClick={clearCart}>
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">Clear Cart</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shopping List Item */}
            {shoppingListData && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-green-600 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h3 className="font-bold text-green-900 text-sm sm:text-base lg:text-lg">📋 Shopping List</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        sessionStorage.removeItem('shoppingListCheckout');
                        setShoppingListData(null);
                      }}
                      className="text-red-600 hover:text-red-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-2 sm:p-3 lg:p-4">
                    <p className="text-[10px] sm:text-xs text-green-700 mb-1">Prepared by our team</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 mb-1 sm:mb-2">Rs. {shoppingListData.estimatedTotal?.toLocaleString()}</p>
                      {shoppingListData.adminNotes && (
                        <p className="text-xs sm:text-sm text-green-800 italic line-clamp-2">"{shoppingListData.adminNotes}"</p>
                      )}
                      {shoppingListData.listText && (
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-green-200">
                          <p className="text-[10px] sm:text-xs text-green-700 mb-1">Your List:</p>
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line line-clamp-3">{shoppingListData.listText}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-green-700 mt-1 sm:mt-2 flex items-center gap-1">
                      ✓ Ready for checkout - Add more items below
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Regular Cart Items */}
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm"
                >
                  <div className="flex gap-2 sm:gap-3 lg:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-600 font-medium mb-1">{item.category_name}</p>
                      <h3 className="font-semibold text-gray-900 truncate">{item.product_name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-gray-900">Rs. {item.unit_price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">/{item.unit_type}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-gray-100 rounded-xl">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-9 w-9 rounded-xl"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-10 text-center font-semibold">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-9 w-9 rounded-xl"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            Rs. {(item.unit_price * item.quantity).toLocaleString()}
                          </p>
                          <button 
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-sm text-red-600 hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <Link to={createPageUrl('Products')} className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                {shoppingListData && (
                  <div className="flex justify-between text-green-700 bg-green-50 p-2 rounded-lg">
                    <span>Shopping List</span>
                    <span className="font-medium">Rs. {shoppingListTotal.toLocaleString()}</span>
                  </div>
                )}
                {cart.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cart Items ({cart.length})</span>
                    <span className="font-medium">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Subtotal</span>
                  <span>Rs. {combinedSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">Rs. {deliveryFee}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-500 bg-emerald-50 p-2 rounded-lg">
                    Add Rs. {500 - combinedSubtotal} more for free delivery
                  </p>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link to={createPageUrl('Checkout')}>
                <Button className="w-full mt-6 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-lg">
                  Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Cash on Delivery Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}