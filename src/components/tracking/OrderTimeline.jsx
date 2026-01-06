import { Clock, CheckCircle2, Package, Truck, Home } from 'lucide-react';
import { format } from 'date-fns';

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'completed', label: 'Delivered', icon: Home }
];

const statusOrder = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed'];

export default function OrderTimeline({ order }) {
  const currentIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-50 rounded-xl">
        <p className="text-red-700 font-medium">Order Cancelled</p>
        <p className="text-sm text-red-600">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
              {/* Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-2 ${
                    index < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="pt-2 pb-4">
                <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-emerald-600 mt-1">
                    {step.key === 'pending' && 'Waiting for confirmation'}
                    {step.key === 'confirmed' && 'Your order has been confirmed'}
                    {step.key === 'preparing' && 'We are preparing your order'}
                    {step.key === 'out_for_delivery' && 'Driver is on the way'}
                    {step.key === 'completed' && 'Order delivered successfully'}
                  </p>
                )}
                {isCompleted && index === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(order.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}