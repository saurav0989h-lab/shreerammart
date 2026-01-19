import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/components/ui/CartContext';
import { Truck, Store, Loader2, Globe, CheckCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import GiftOrderForm from '@/components/checkout/GiftOrderForm';
import PaymentProcessor from '@/components/checkout/PaymentProcessor';
import { convertToUSD, formatConvertedPrice } from '@/utils/currency';
import { useCurrency } from '@/components/ui/CurrencyContext';
import LocationPicker from '@/components/checkout/LocationPicker';
import ReplacementSelector from '@/components/checkout/ReplacementSelector';
import { sendOrderConfirmationEmail } from '@/components/utils/emailService.jsx';
import { calculateDeliveryFee, findNearestShop } from '@/components/utils/distanceCalculator.jsx';

const municipalities = [
  'Ghorahi Sub-Metropolitan',
  'Tulsipur Sub-Metropolitan',
  'Lamahi Municipality',
  'Rapti Rural Municipality',
  'Dangisharan Rural Municipality',
  'Shantinagar Rural Municipality',
  'Rajpur Rural Municipality',
  'Gadhawa Rural Municipality',
  'Banglachuli Rural Municipality',
  'Babai Rural Municipality'
];

const timeSlots = [
  { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)' },
  { value: 'evening', label: 'Evening (4:00 PM - 7:00 PM)' }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, setCart } = useCart();
  const { getSecondaryCurrencies, isIndianUser } = useCurrency();
  const [shoppingListData, setShoppingListData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInternationalOrder, setIsInternationalOrder] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [replacementPreferences, setReplacementPreferences] = useState({});
  const [showReplacementSelector, setShowReplacementSelector] = useState(false);
  const [selectedItemForReplacement, setSelectedItemForReplacement] = useState(null);
  const [replacementMappings, setReplacementMappings] = useState({});
  const [availableProducts, setAvailableProducts] = useState([]);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_method: 'home_delivery',
    pickup_location: '',
    address_municipality: '',
    address_ward: '',
    address_area: '',
    address_landmark: '',
    delivery_date: '',
    delivery_time_slot: 'morning',
    delivery_note: '',
    payment_method: 'cod',
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    gift_message: '',
    latitude: null,
    longitude: null
  });

  const { data: shopLocations = [] } = useQuery({
    queryKey: ['shop-locations'],
    queryFn: () => base44.entities.ShopLocation.filter({ is_active: true }),
  });

  const { data: deliverySettings } = useQuery({
    queryKey: ['delivery-settings'],
    queryFn: async () => {
      const result = await base44.entities.DeliverySettings.list();
      return result[0] || null;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }),
    onSuccess: (data) => {
      // Normalize to ReplacementSelector expected shape
      const normalized = (data || []).map(p => ({
        product_id: p.id,
        product_name: p.name,
        unit_price: p.discount_price || p.base_price || 0,
        category: p.category_name || 'Other',
        stock: p.stock_quantity ?? 0,
        description: p.description || ''
      }));
      setAvailableProducts(normalized);
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        console.log('Not authenticated');
      }
    };
    loadUser();

    // Check if this is a shopping list checkout
    const shoppingListCheckout = sessionStorage.getItem('shoppingListCheckout');
    if (shoppingListCheckout) {
      const listData = JSON.parse(shoppingListCheckout);
      setShoppingListData(listData);
      setFormData(prev => ({
        ...prev,
        customer_name: listData.customerName,
        customer_phone: listData.customerPhone,
        customer_email: listData.customerEmail || '',
        delivery_note: listData.adminNotes || ''
      }));
    }
  }, []);

  const isBusinessAccount = user?.is_business_account || false;
  const shoppingListTotal = shoppingListData ? shoppingListData.estimatedTotal : 0;
  const orderSubtotal = shoppingListTotal + cartTotal;
  const businessDiscount = isBusinessAccount ? orderSubtotal * 0.1 : 0;
  const discountedTotal = orderSubtotal - businessDiscount;

  const deliveryFee = useMemo(() => {
    if (formData.delivery_method === 'pickup' || isBusinessAccount) return 0;

    // If no location set, use default logic
    if (!formData.latitude || !formData.longitude) {
      return cartTotal >= 500 ? 0 : 50;
    }

    // Calculate distance to nearest shop
    const nearest = findNearestShop(formData.latitude, formData.longitude, shopLocations);
    if (!nearest) {
      return cartTotal >= 500 ? 0 : 50;
    }

    // Calculate fee based on distance and settings
    return calculateDeliveryFee(nearest.distance, orderSubtotal, deliverySettings);
  }, [formData.delivery_method, formData.latitude, formData.longitude, orderSubtotal, shopLocations, deliverySettings, isBusinessAccount, cartTotal]);

  const distanceInfo = useMemo(() => {
    if (formData.delivery_method === 'pickup' || !formData.latitude || !formData.longitude) return null;
    const nearest = findNearestShop(formData.latitude, formData.longitude, shopLocations);
    return nearest;
  }, [formData.delivery_method, formData.latitude, formData.longitude, shopLocations]);

  const grandTotal = discountedTotal + deliveryFee;
  const isCreditPayment = formData.payment_method === 'credit';
  const isOnlinePayment = !isCreditPayment && ['esewa', 'khalti', 'paypal', 'card', 'upi', 'phonepe', 'fonepay'].includes(formData.payment_method);
  const isInternationalPayment = ['paypal', 'card', 'upi', 'phonepe', 'fonepay'].includes(formData.payment_method);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address_municipality: locationData.municipality || prev.address_municipality,
      address_ward: locationData.ward || prev.address_ward,
      address_area: locationData.area || prev.address_area,
      address_landmark: locationData.landmark || prev.address_landmark
    }));
  };

  const handleReplacementPreference = (itemId, value) => {
    setReplacementPreferences(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleOpenReplacementSelector = (item) => {
    // Map cart item to selector's expected shape
    const original = {
      id: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      unit_price: item.unit_price
    };
    setSelectedItemForReplacement(original);
    setShowReplacementSelector(true);
  };

  const handleSelectReplacement = ({ original, replacement, priceComparison }) => {
    // Store the replacement mapping
    setReplacementMappings(prev => ({
      ...prev,
      [original.id]: {
        original,
        replacement,
        priceComparison
      }
    }));

    toast.success(`Replacement selected for ${original.name}. Admin will verify availability.`);
  };

  const handleConfirmReplacementFromAdmin = async (orderId, itemId, replacementMapping) => {
    try {
      // Calculate the price adjustment
      const priceDifference = replacementMapping.priceComparison.difference;

      // Update the order with replacement info
      await base44.entities.Order.update(orderId, {
        replacement_status: 'approved_by_admin',
        replacement_items: JSON.stringify({
          ...replacementMapping
        }),
        replacement_date: new Date().toISOString(),
        replacement_approved_date: new Date().toISOString()
      });

      // Update local cart to reflect the new item
      const updatedCart = cart.map(item => {
        if (item.id === itemId && replacementMapping) {
          return {
            ...item,
            product_id: replacementMapping.replacement.product_id,
            product_name: replacementMapping.replacement.product_name,
            name: replacementMapping.replacement.product_name,
            unit_price: replacementMapping.replacement.unit_price,
            price: replacementMapping.replacement.unit_price,
            replacement_from: replacementMapping.original,
            is_replacement: true
          };
        }
        return item;
      });

      setCart(updatedCart);
      toast.success('Item replacement applied to order');
      return true;
    } catch (error) {
      toast.error('Failed to apply replacement: ' + error.message);
      return false;
    }
  };

  const removeReplacementMapping = (itemId) => {
    setReplacementMappings(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DNG-${dateStr}-${random}`;
  };

  const validateForm = () => {
    if (!shoppingListData && cart.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }

    if (shoppingListData && !shoppingListData.estimatedTotal) {
      toast.error('Shopping list total is missing');
      return false;
    }

    if (!formData.customer_name || !formData.customer_phone) {
      toast.error('Please fill in recipient name and phone number');
      return false;
    }

    if (formData.delivery_method === 'home_delivery') {
      if (!formData.address_municipality || !formData.address_area) {
        toast.error('Please fill in delivery address');
        return false;
      }
    } else if (!formData.pickup_location) {
      toast.error('Please select a pickup location');
      return false;
    }

    if (isInternationalOrder) {
      if (!formData.sender_name || !formData.sender_email) {
        toast.error('Please fill in your contact information');
        return false;
      }
    }

    return true;
  };

  const createOrderData = () => {
    const orderNumber = shoppingListData ? `SL-${Date.now()}` : generateOrderNumber();

    // Use shopping list items if available, otherwise use cart items
    let orderItems = [];
    if (shoppingListData?.listItems && Array.isArray(shoppingListData.listItems)) {
      // Transform shopping list items to order item format
      orderItems = shoppingListData.listItems.map(item => ({
        product_id: item.product_id || item.id || null,
        product_name: item.product_name || item.name || 'Item',
        quantity: item.quantity || 1,
        unit_type: item.unit_type || item.unit || 'pc',
        unit_price: item.unit_price || item.price || 0,
        total_price: (item.unit_price || item.price || 0) * (item.quantity || 1),
        category_name: item.category_name || item.category || 'Other'
      }));
    } else {
      // Use regular cart items
      orderItems = cart.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_type: item.unit_type,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        category_name: item.category_name,
        customizations: item.customizations || null
      }));
    }

    return {
      order_number: orderNumber,
      ...formData,
      items: orderItems,
      shopping_list_text: shoppingListData?.listText || null,
      shopping_list_photos: shoppingListData?.listPhotos || null,
      shopping_list_total: shoppingListTotal,
      subtotal: orderSubtotal,
      business_discount: businessDiscount,
      delivery_fee: deliveryFee,
      total_amount: grandTotal,
      total_amount_usd: isInternationalPayment ? convertToUSD(grandTotal) : null,
      status: 'pending',
      payment_status: isCreditPayment ? 'pending' : (isOnlinePayment ? 'processing' : 'pending'),
      is_international_order: isInternationalOrder,
      is_gift: isGift,
      replacement_preferences: Object.keys(replacementPreferences).filter(id => replacementPreferences[id]).length > 0 ? replacementPreferences : null,
      replacement_mappings: Object.keys(replacementMappings).length > 0 ? JSON.stringify(replacementMappings) : null,
      has_replacements: Object.keys(replacementMappings).length > 0
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isOnlinePayment) {
        // For online payments, create order first then process payment
        setIsSubmitting(true);
        const orderData = createOrderData();
        const order = await base44.entities.Order.create(orderData);
        setPendingOrder({ ...order, ...orderData });
        setShowPaymentProcessor(true);
        setIsSubmitting(false);
      } else {
        // For COD/Pay at pickup/Credit, create order directly
        setIsSubmitting(true);
        const orderData = createOrderData();
        const order = await base44.entities.Order.create(orderData);

        // If credit payment, create credit record and update user balance
        if (isCreditPayment) {
          await base44.entities.CreditOrder.create({
            user_email: user.email,
            order_id: order.id,
            order_number: order.order_number,
            amount: grandTotal,
            payment_status: 'pending',
            due_date: calculateDueDate(user.credit_payment_terms)
          });

          // Update user credit balance
          await base44.auth.updateMe({
            current_credit_balance: (user.current_credit_balance || 0) + grandTotal
          });
        }

        // If shopping list order, update the list and send admin notification
        if (shoppingListData) {
          await base44.entities.ShoppingList.update(shoppingListData.listId, {
            status: 'paid',
            order_id: order.id,
            delivery_method: formData.delivery_method
          });

          // Send admin notification (non-blocking)
          base44.integrations.Core.SendEmail({
            to: 'admin@dangmarket.com',
            subject: '🛒 New Shopping List Order Placed',
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">New Shopping List Order</h2>
                <p>A customer has completed checkout for their shopping list.</p>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Order Number:</strong> ${order.order_number}</p>
                  <p><strong>Customer:</strong> ${order.customer_name}</p>
                  <p><strong>Phone:</strong> ${order.customer_phone}</p>
                  <p><strong>Total Amount:</strong> Rs. ${order.total_amount.toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
                </div>
                
                <p>Please prepare the order and begin the delivery process.</p>
              </div>
            `
          }).catch(err => console.error('Email send failed:', err));

          sessionStorage.removeItem('shoppingListCheckout');
        }

        // Send order confirmation email (non-blocking)
        sendOrderConfirmationEmail({ ...order, ...orderData }).catch(err => console.error('Confirmation email failed:', err));

        clearCart();
        setIsSubmitting(false);
        toast.success('Order placed successfully!');
        navigate(`${createPageUrl('OrderConfirmation')}?orderId=${order.id}`);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      console.error('Error details:', error.message, error.stack);
      toast.error(error.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const calculateDueDate = (terms) => {
    const date = new Date();
    if (terms === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (terms === 'per_bill') {
      date.setDate(date.getDate() + 7);
    }
    return date.toISOString().split('T')[0];
  };

  const handlePaymentSuccess = async (paymentResult) => {
    // Update order with payment details
    const updateData = {
      payment_status: ['upi', 'phonepe', 'fonepay'].includes(formData.payment_method) ? 'processing' : 'completed',
      payment_reference: paymentResult.transactionId,
      payment_details: paymentResult
    };

    // Add screenshot for QR-based payments
    if (paymentResult.paymentProof?.screenshot_url) {
      updateData.payment_screenshot = paymentResult.paymentProof.screenshot_url;
    }

    await base44.entities.Order.update(pendingOrder.id, updateData);

    // If shopping list order, update the list and send admin notification
    if (shoppingListData) {
      await base44.entities.ShoppingList.update(shoppingListData.listId, {
        status: 'paid',
        order_id: pendingOrder.id,
        delivery_method: formData.delivery_method
      });

      // Send admin notification
      await base44.integrations.Core.SendEmail({
        to: 'admin@dangmarket.com',
        subject: '🛒 New Shopping List Order Placed',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">New Shopping List Order</h2>
            <p>A customer has completed checkout for their shopping list.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order Number:</strong> ${pendingOrder.order_number}</p>
              <p><strong>Customer:</strong> ${pendingOrder.customer_name}</p>
              <p><strong>Phone:</strong> ${pendingOrder.customer_phone}</p>
              <p><strong>Total Amount:</strong> Rs. ${pendingOrder.total_amount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${pendingOrder.payment_method.toUpperCase()}</p>
            </div>
            
            <p>Please prepare the order and begin the delivery process.</p>
          </div>
        `
      });

      sessionStorage.removeItem('shoppingListCheckout');
    }

    // Send order confirmation email
    sendOrderConfirmationEmail(pendingOrder);

    clearCart();
    setShowPaymentProcessor(false);
    navigate(`${createPageUrl('OrderConfirmation')}?orderId=${pendingOrder.id}`);
  };

  const handlePaymentFailure = async () => {
    // Update order with failed payment status
    await base44.entities.Order.update(pendingOrder.id, {
      payment_status: 'failed'
    });
    toast.error('Payment failed. Please try again.');
  };

  if (!shoppingListData && cart.length === 0 && !showPaymentProcessor) {
    navigate(createPageUrl('Home'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
              {/* International Order & Gift Option */}
              <GiftOrderForm
                formData={formData}
                onChange={handleChange}
                isInternationalOrder={isInternationalOrder}
                onToggleInternational={(checked) => {
                  setIsInternationalOrder(checked);
                  if (checked) {
                    handleChange('payment_method', 'upi');
                  } else {
                    handleChange('payment_method', 'cod');
                    setIsGift(false);
                  }
                }}
                isGift={isGift}
                onToggleGift={setIsGift}
              />

              {/* Recipient Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {isInternationalOrder ? 'Recipient Information (in Nepal)' : 'Contact Information'}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">{isInternationalOrder ? 'Recipient Name' : 'Full Name'} *</Label>
                    <Input
                      id="name"
                      placeholder={isInternationalOrder ? "Recipient's full name" : "Your full name"}
                      value={formData.customer_name}
                      onChange={(e) => handleChange('customer_name', e.target.value)}
                      className="mt-1 h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{isInternationalOrder ? 'Recipient Phone' : 'Phone Number'} *</Label>
                    <Input
                      id="phone"
                      placeholder="98XXXXXXXX"
                      value={formData.customer_phone}
                      onChange={(e) => handleChange('customer_phone', e.target.value)}
                      className="mt-1 h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{isInternationalOrder ? 'Recipient Email' : 'Email'} (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="recipient@email.com"
                      value={formData.customer_email}
                      onChange={(e) => handleChange('customer_email', e.target.value)}
                      className="mt-1 h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Method</h2>
                <RadioGroup
                  value={formData.delivery_method}
                  onValueChange={(value) => {
                    handleChange('delivery_method', value);
                    if (value === 'pickup' && formData.payment_method === 'cod') {
                      // Switch from COD to pay_at_pickup when pickup is selected
                      handleChange('payment_method', 'pay_at_pickup');
                    }
                  }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.delivery_method === 'home_delivery' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <RadioGroupItem value="home_delivery" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold">Home Delivery</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        We deliver to your doorstep in Dang
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.delivery_method === 'pickup' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <RadioGroupItem value="pickup" className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold">Pickup from Shop</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Pick up your order from our shop
                      </p>
                    </div>
                  </label>
                </RadioGroup>

                {/* Address Fields */}
                {formData.delivery_method === 'home_delivery' && (
                  <div className="mt-6 space-y-4">
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Municipality *</Label>
                        <Select value={formData.address_municipality} onValueChange={(v) => handleChange('address_municipality', v)}>
                          <SelectTrigger className="mt-1 h-11 rounded-xl">
                            <SelectValue placeholder="Select Municipality" />
                          </SelectTrigger>
                          <SelectContent>
                            {municipalities.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Ward Number</Label>
                        <Input
                          placeholder="Ward No."
                          value={formData.address_ward}
                          onChange={(e) => handleChange('address_ward', e.target.value)}
                          className="mt-1 h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Area / Tole *</Label>
                      <Input
                        placeholder="e.g., Surkhet Road, Buspark Area"
                        value={formData.address_area}
                        onChange={(e) => handleChange('address_area', e.target.value)}
                        className="mt-1 h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label>Landmark (Optional)</Label>
                      <Input
                        placeholder="Near hospital, opposite to school, etc."
                        value={formData.address_landmark}
                        onChange={(e) => handleChange('address_landmark', e.target.value)}
                        className="mt-1 h-11 rounded-xl"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Preferred Delivery Date</Label>
                        <Input
                          type="date"
                          value={formData.delivery_date}
                          onChange={(e) => handleChange('delivery_date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 h-11 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>Time Slot</Label>
                        <Select value={formData.delivery_time_slot} onValueChange={(v) => handleChange('delivery_time_slot', v)}>
                          <SelectTrigger className="mt-1 h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(slot => (
                              <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Location */}
                {formData.delivery_method === 'pickup' && (
                  <div className="mt-6">
                    <Label>Select Pickup Location *</Label>
                    <Select value={formData.pickup_location} onValueChange={(v) => handleChange('pickup_location', v)}>
                      <SelectTrigger className="mt-1 h-11 rounded-xl">
                        <SelectValue placeholder="Choose a shop location" />
                      </SelectTrigger>
                      <SelectContent>
                        {shopLocations.length > 0 ? (
                          shopLocations.map(shop => (
                            <SelectItem key={shop.id} value={shop.name}>
                              {shop.name} - {shop.address}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Main Bazaar Grocery Shop">Main Bazaar Grocery Shop - Ghorahi</SelectItem>
                            <SelectItem value="Buspark Dairy & Breakfast">Buspark Dairy & Breakfast - Ghorahi</SelectItem>
                            <SelectItem value="Tulsipur Bakery Center">Tulsipur Bakery Center - Tulsipur</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="mt-4">
                  <Label>Delivery Note (Optional)</Label>
                  <Textarea
                    placeholder="Any special instructions..."
                    value={formData.delivery_note}
                    onChange={(e) => handleChange('delivery_note', e.target.value)}
                    className="mt-1 rounded-xl"
                    rows={3}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <PaymentMethodSelector
                  value={formData.payment_method}
                  onChange={(v) => handleChange('payment_method', v)}
                  deliveryMethod={formData.delivery_method}
                  isInternational={isInternationalOrder}
                  isBusinessAccount={isBusinessAccount}
                  creditLimit={user?.credit_limit}
                  currentBalance={user?.current_credit_balance}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Replacement Preference Section */}
                {cart.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 sticky top-24">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Item Replacement (Optional)</h2>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3">If an item is out of stock, allow suggestions:</p>
                    <div className="space-y-2">
                      {cart.map(item => {
                        const hasReplacement = replacementMappings[item.product_id];
                        return (
                          <div key={item.product_id} className="p-2 bg-white rounded-lg border">
                            <div className="flex items-center gap-2 justify-between">
                              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={replacementPreferences[item.product_id] || false}
                                  onChange={(e) => handleReplacementPreference(item.product_id, e.target.checked)}
                                  className="w-4 h-4 rounded cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
                                  <p className="text-xs text-gray-600">{item.quantity} × Rs. {item.unit_price}</p>
                                </div>
                              </label>
                              {replacementPreferences[item.product_id] && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => handleOpenReplacementSelector(item)}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  {hasReplacement ? 'Change' : 'Select'} Replacement
                                </Button>
                              )}
                            </div>
                            {hasReplacement && (
                              <div className="mt-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                                <p className="text-xs text-emerald-700 font-medium">
                                  ✓ Replacement: <span className="font-semibold">{hasReplacement.replacement.product_name}</span>
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-emerald-600">
                                    Rs. {hasReplacement.replacement.unit_price?.toLocaleString()}
                                    {hasReplacement.priceComparison.isHigher && (
                                      <span className="ml-1 text-amber-600">(+Rs. {hasReplacement.priceComparison.difference.toLocaleString()})</span>
                                    )}
                                    {hasReplacement.priceComparison.isLower && (
                                      <span className="ml-1 text-green-600">(-Rs. {Math.abs(hasReplacement.priceComparison.difference).toLocaleString()})</span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => removeReplacementMapping(item.product_id)}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">💡 Select replacements if available items are out of stock</p>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-80">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                  {shoppingListData && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl mb-3 sm:mb-4 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-green-600 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-bold text-green-900">📋 Your Shopping List Order</p>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700 mb-1">Prepared by our team</p>
                        <p className="text-2xl font-bold text-green-900">Rs. {shoppingListData.estimatedTotal?.toLocaleString()}</p>
                        {shoppingListData.adminNotes && (
                          <p className="text-xs text-green-700 mt-2 italic">"{shoppingListData.adminNotes}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">🛒 Additional Items from Cart</p>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {cart.map(item => (
                          <div key={item.product_id} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {item.product_name} × {item.quantity}
                              </span>
                              <span className="font-medium">Rs. {(item.unit_price * item.quantity).toLocaleString()}</span>
                            </div>
                            {item.customizations && (item.customizations.cake_message || item.customizations.cake_photo_url) && (
                              <div className="mt-1 ml-2 p-2 bg-amber-50 border border-amber-200 rounded">
                                {item.customizations.cake_message && (
                                  <p className="text-xs text-amber-900"><span className="font-medium">Cake Message:</span> {item.customizations.cake_message}</p>
                                )}
                                {item.customizations.cake_photo_url && (
                                  <div className="mt-1">
                                    <img src={item.customizations.cake_photo_url} alt="Cake" className="w-16 h-16 object-cover rounded border border-amber-200" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2 text-sm">
                    {shoppingListData && shoppingListTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shopping List</span>
                        <span>Rs. {shoppingListTotal.toLocaleString()}</span>
                      </div>
                    )}
                    {cartTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cart Items</span>
                        <span>Rs. {cartTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600">Subtotal</span>
                      <span>Rs. {orderSubtotal.toLocaleString()}</span>
                    </div>
                    {isBusinessAccount && businessDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Business Discount (10%)</span>
                        <span>- Rs. {businessDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-medium">
                          FREE {isBusinessAccount && '(Business Account)'}
                        </span>
                      ) : (
                        <span>Rs. {deliveryFee}</span>
                      )}
                    </div>
                    {distanceInfo && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Distance from {distanceInfo.shop.name}</span>
                        <span>{distanceInfo.distance.toFixed(1)} km</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-emerald-600">Rs. {grandTotal.toLocaleString()}</span>
                    </div>
                    {isInternationalPayment && (
                      <div className="flex justify-between text-sm text-blue-600 bg-blue-50 p-2 rounded-lg mt-2">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" /> USD Amount
                        </span>
                        <span className="font-medium">${convertToUSD(grandTotal).toFixed(2)}</span>
                      </div>
                    )}
                    {!isInternationalPayment && getSecondaryCurrencies().length > 0 && (
                      <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t border-gray-100">
                        {isIndianUser ? (
                          <>
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                              ≈ {formatConvertedPrice(grandTotal, 'INR')}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded">
                              ≈ {formatConvertedPrice(grandTotal, 'USD')}
                            </span>
                          </>
                        ) : (
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded ml-auto">
                            ≈ {formatConvertedPrice(grandTotal, 'USD')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                      </>
                    ) : isOnlinePayment ? (
                      `Pay Rs. ${grandTotal.toLocaleString()}`
                    ) : isCreditPayment ? (
                      'Place Order on Credit'
                    ) : (
                      'Place Order'
                    )}
                  </Button>

                  {isBusinessAccount && isCreditPayment && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                      <p>Payment Terms: {user?.credit_payment_terms === 'monthly' ? 'Monthly Billing' : user?.credit_payment_terms === 'per_bill' ? 'Pay per Bill' : 'Credit Limit Based'}</p>
                      <p className="mt-1">Available Credit: Rs. {((user?.credit_limit || 0) - (user?.current_credit_balance || 0)).toLocaleString()}</p>
                    </div>
                  )}

                  <p className="text-xs text-center text-gray-500 mt-4">
                    {isOnlinePayment
                      ? 'You will be redirected to complete payment securely'
                      : isCreditPayment
                        ? 'Order will be added to your credit account'
                        : 'By placing this order, you agree to our terms and conditions'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Processor Modal */}
      {pendingOrder && (
        <PaymentProcessor
          isOpen={showPaymentProcessor}
          onClose={() => setShowPaymentProcessor(false)}
          paymentMethod={formData.payment_method}
          amount={grandTotal}
          orderId={pendingOrder.id}
          orderNumber={pendingOrder.order_number}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      )}

      {/* Replacement Selector Modal */}
      {selectedItemForReplacement && (
        <ReplacementSelector
          isOpen={showReplacementSelector}
          onClose={() => {
            setShowReplacementSelector(false);
            setSelectedItemForReplacement(null);
          }}
          originalItem={selectedItemForReplacement}
          availableProducts={availableProducts}
          onSelectReplacement={handleSelectReplacement}
        />
      )}
    </div>
  );
}