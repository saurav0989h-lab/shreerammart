import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package, MapPin, Phone, Clock, Banknote, Home, Store, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function OrderConfirmation() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => base44.entities.Order.filter({ id: orderId }),
    enabled: !!orderId,
    select: (data) => data[0]
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Go to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order. We'll contact you shortly.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-emerald-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Order Number</p>
                <p className="text-2xl font-bold">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-sm">Total Amount</p>
                <p className="text-2xl font-bold">Rs. {order.total_amount?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
              <Package className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Order Status: Pending</p>
                <p className="text-sm text-amber-700">We'll confirm your order within 30 minutes</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                {order.delivery_method === 'home_delivery' ? (
                  <><Truck className="w-5 h-5 text-emerald-600" /> Home Delivery</>
                ) : (
                  <><Store className="w-5 h-5 text-emerald-600" /> Pickup from Shop</>
                )}
              </h3>
              
              {order.delivery_method === 'home_delivery' ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p>{order.address_area}, Ward {order.address_ward}</p>
                      <p>{order.address_municipality}</p>
                      {order.address_landmark && <p className="text-gray-500">Near: {order.address_landmark}</p>}
                    </div>
                  </div>
                  {order.delivery_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {format(new Date(order.delivery_date), 'PPP')} - {
                          order.delivery_time_slot === 'morning' ? 'Morning (8 AM - 12 PM)' :
                          order.delivery_time_slot === 'afternoon' ? 'Afternoon (12 PM - 4 PM)' :
                          'Evening (4 PM - 7 PM)'
                        }
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-medium">{order.pickup_location}</p>
                  <p className="text-sm text-gray-500 mt-1">We'll call you when your order is ready</p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-medium">{order.customer_name}</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{order.customer_phone}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              order.payment_status === 'completed' ? 'bg-green-50' : 
              (order.payment_method === 'cod' || order.payment_method === 'pay_at_pickup') ? 'bg-amber-50' : 
              'bg-blue-50'
            }`}>
              <Banknote className={`w-6 h-6 ${
                order.payment_status === 'completed' ? 'text-green-600' : 
                (order.payment_method === 'cod' || order.payment_method === 'pay_at_pickup') ? 'text-amber-600' : 
                'text-blue-600'
              }`} />
              <div>
                <p className={`font-semibold ${
                  order.payment_status === 'completed' ? 'text-green-800' : 
                  (order.payment_method === 'cod' || order.payment_method === 'pay_at_pickup') ? 'text-amber-800' : 
                  'text-blue-800'
                }`}>
                  {order.payment_method === 'cod' && 'Cash on Delivery'}
                  {order.payment_method === 'pay_at_pickup' && 'Pay at Pickup'}
                  {order.payment_method === 'esewa' && 'eSewa Payment'}
                  {order.payment_method === 'khalti' && 'Khalti Payment'}
                  {order.payment_method === 'paypal' && 'PayPal Payment'}
                  {order.payment_method === 'card' && 'Card Payment'}
                </p>
                {order.payment_status === 'completed' ? (
                  <p className="text-sm text-green-700">
                    ✓ Payment completed - Rs. {order.total_amount?.toLocaleString()}
                    {order.payment_reference && <span className="block text-xs">Ref: {order.payment_reference}</span>}
                  </p>
                ) : (order.payment_method === 'cod' || order.payment_method === 'pay_at_pickup') ? (
                  <p className="text-sm text-amber-700">
                    💵 Pay Rs. {order.total_amount?.toLocaleString()} when you receive your order
                  </p>
                ) : (
                  <p className="text-sm text-blue-700">
                    Payment processing - Rs. {order.total_amount?.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Gift Message */}
            {order.gift_message && (
              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-pink-600 font-medium mb-1">🎁 Gift Message:</p>
                <p className="text-gray-700 italic">"{order.gift_message}"</p>
                {order.sender_name && (
                  <p className="text-sm text-gray-500 mt-2">From: {order.sender_name}</p>
                )}
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="divide-y">
                {order.items?.map((item, index) => (
                  <div key={index} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} × Rs. {item.unit_price}</p>
                      </div>
                      <p className="font-medium">Rs. {item.total_price?.toLocaleString()}</p>
                    </div>
                    {(() => {
                      let cz = item.customizations;
                      if (!cz && typeof item.customizations === 'string') {
                        try { cz = JSON.parse(item.customizations); } catch (e) { /* ignore parse errors */ }
                      }
                      if (!cz) return null;
                      if (!(cz.cake_message || cz.cake_photo_url)) return null;
                      return (
                        <div className="mt-2 ml-2 p-2 bg-amber-50 border border-amber-200 rounded">
                          {cz.cake_message && (
                            <p className="text-xs text-amber-900"><span className="font-semibold">Cake Message:</span> {cz.cake_message}</p>
                          )}
                          {cz.cake_photo_url && (
                            <img src={cz.cake_photo_url} alt="Cake" className="mt-1 w-16 h-16 object-cover rounded border border-amber-200" />
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs. {order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  {order.delivery_fee === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    <span>Rs. {order.delivery_fee}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-red-600">Rs. {order.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {order.delivery_note && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Note</h3>
                <p className="text-gray-600 bg-gray-50 rounded-xl p-4">{order.delivery_note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="w-full sm:w-auto px-8">
              <Home className="w-4 h-4 mr-2" /> Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions about your order? Contact us at</p>
          <p className="font-medium text-gray-900">+977-9800000000</p>
        </div>
      </div>
    </div>
  );
}

function Truck(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  );
}