import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingBag, Package, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderHistory({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Order History</CardTitle>
        <Link to={createPageUrl('OrderTracking')}>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" /> Track Orders
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{orders.length}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="text-center border-x">
            <p className="text-2xl font-bold text-emerald-600">{completedOrders}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">Rs. {totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No orders yet</p>
            <Link to={createPageUrl('Products')}>
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map(order => (
              <div key={order.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.created_date), 'MMM d, yyyy')} • {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">Rs. {order.total_amount?.toLocaleString()}</p>
                      <Badge className={statusColors[order.status]}>
                        {order.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {orders.length > 10 && (
              <Link to={createPageUrl('OrderTracking')}>
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order {selectedOrder.order_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <Badge className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Date</span>
                  <span>{format(new Date(selectedOrder.created_date), 'PPP')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment</span>
                  <span className="capitalize">{selectedOrder.payment_method?.replace(/_/g, ' ')}</span>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>Rs. {item.total_price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>Rs. {selectedOrder.delivery_fee || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600">Rs. {selectedOrder.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}