import { Banknote, Store, CreditCard, Wallet, Globe } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

const paymentMethods = {
  local: [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: Banknote,
      available: true
    },
    {
      id: 'pay_at_pickup',
      name: 'Pay at Pickup',
      description: 'Pay when you pick up your order',
      icon: Store,
      requiresPickup: true,
      available: true
    },
    {
      id: 'esewa',
      name: 'eSewa',
      description: 'Pay with eSewa digital wallet',
      icon: Wallet,
      logo: 'https://esewa.com.np/common/images/esewa-logo.png',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'khalti',
      name: 'Khalti',
      description: 'Pay with Khalti digital wallet',
      icon: Wallet,
      logo: 'https://khalti.com/static/img/khalti-logo.png',
      color: 'bg-purple-600',
      available: true
    }
  ],
  international: [
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay via UPI (PhonePe, Google Pay, Paytm)',
      icon: Wallet,
      color: 'bg-indigo-600',
      available: true,
      badge: 'India'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      description: 'Scan QR code and pay',
      icon: Wallet,
      color: 'bg-purple-600',
      available: true,
      badge: 'India'
    },
    {
      id: 'fonepay',
      name: 'Fonepay',
      description: 'Pay with Fonepay QR',
      icon: Wallet,
      color: 'bg-blue-500',
      available: true,
      badge: 'Nepal Banks'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with PayPal',
      icon: Globe,
      color: 'bg-blue-600',
      available: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      color: 'bg-gray-800',
      available: true
    }
  ]
};

export default function PaymentMethodSelector({ 
  value, 
  onChange, 
  deliveryMethod,
  isInternational = false,
  isBusinessAccount = false,
  creditLimit = 0,
  currentBalance = 0
}) {
  let methods = isInternational ? paymentMethods.international : paymentMethods.local;
  
  // Add credit payment for business accounts
  if (isBusinessAccount && !isInternational) {
    methods = [
      {
        id: 'credit',
        name: 'Pay on Credit',
        description: `Available credit: Rs. ${((creditLimit || 0) - (currentBalance || 0)).toLocaleString()}`,
        icon: CreditCard,
        color: 'bg-blue-600',
        available: true,
        badge: 'Business'
      },
      ...methods
    ];
  }

  const filteredMethods = methods.filter(m => {
    if (m.requiresPickup && deliveryMethod !== 'pickup') return false;
    // Remove Cash on Delivery when pickup is selected
    if (m.id === 'cod' && deliveryMethod === 'pickup') return false;
    return m.available;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Payment Method</h3>
        {isInternational && (
          <Badge className="bg-blue-100 text-blue-800">
            <Globe className="w-3 h-3 mr-1" /> International Payment
          </Badge>
        )}
      </div>
      
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {filteredMethods.map(method => (
          <label
            key={method.id}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              value === method.id 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value={method.id} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {method.logo ? (
                  <div className={`w-8 h-8 ${method.color || 'bg-gray-100'} rounded-lg flex items-center justify-center p-1`}>
                    <img src={method.logo} alt={method.name} className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                ) : (
                  <div className={`w-8 h-8 ${method.color || 'bg-emerald-100'} rounded-lg flex items-center justify-center`}>
                    <method.icon className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="font-semibold">{method.name}</span>
                {method.id === 'cod' && (
                  <Badge variant="outline" className="text-xs">Popular</Badge>
                )}
                {method.id === 'credit' && (
                  <Badge className="text-xs bg-blue-600">Business Only</Badge>
                )}
                {method.badge && method.id !== 'credit' && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{method.badge}</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-10">{method.description}</p>
            </div>
          </label>
        ))}
      </RadioGroup>

      {!isInternational && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            <Globe className="w-4 h-4 inline mr-1" />
            <strong>Sending a gift from abroad?</strong> International payment options (PayPal, Card) are available for orders placed from outside Nepal.
          </p>
        </div>
      )}
    </div>
  );
}