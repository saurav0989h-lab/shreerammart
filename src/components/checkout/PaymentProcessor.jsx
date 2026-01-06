import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import QRPaymentModal from './QRPaymentModal';
import { convertToUSD } from '@/utils/currency';

// Note: In production, these would be actual payment gateway integrations
// For now, we simulate the payment flow

export default function PaymentProcessor({ 
  isOpen, 
  onClose, 
  paymentMethod, 
  amount, 
  orderId,
  orderNumber,
  onPaymentSuccess, 
  onPaymentFailure: _onPaymentFailure 
}) {
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [transactionId, setTransactionId] = useState(null);

  const amountUSD = convertToUSD(amount);

  // Fetch payment settings for QR codes
  const { data: paymentSettings } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const result = await base44.entities.PaymentSettings.list();
      return result[0] || null;
    }
  });

  // Check if this is a QR-based payment method
  const isQRPayment = ['upi', 'phonepe', 'fonepay'].includes(paymentMethod);

  // Simulate payment processing
  useEffect(() => {
    if (isOpen && status === 'processing' && !isQRPayment) {
      const timer = setTimeout(() => {
        // Simulate success (in production, this would be actual gateway response)
        const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setTransactionId(txnId);
        setStatus('success');
        onPaymentSuccess({
          transactionId: txnId,
          method: paymentMethod,
          amount: paymentMethod === 'paypal' || paymentMethod === 'card' ? amountUSD : amount,
          currency: paymentMethod === 'paypal' || paymentMethod === 'card' ? 'USD' : 'NPR'
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status, amount, amountUSD, onPaymentSuccess, paymentMethod, isQRPayment]);

  const handleClose = () => {
    setStatus('processing');
    setTransactionId(null);
    onClose();
  };

  // If it's a QR payment, show the QR modal instead
  if (isQRPayment && paymentSettings) {
    let qrCodeUrl, upiId, merchantCode;
    
    if (paymentMethod === 'upi') {
      qrCodeUrl = paymentSettings.upi_qr_code;
      upiId = paymentSettings.upi_id;
    } else if (paymentMethod === 'phonepe') {
      qrCodeUrl = paymentSettings.phonepe_qr_code;
      merchantCode = paymentSettings.phonepe_merchant_id;
    } else if (paymentMethod === 'fonepay') {
      qrCodeUrl = paymentSettings.fonepay_qr_code;
      merchantCode = paymentSettings.fonepay_merchant_code;
    }

    return (
      <QRPaymentModal
        isOpen={isOpen}
        onClose={onClose}
        paymentMethod={paymentMethod}
        amount={amount}
        orderId={orderId}
        orderNumber={orderNumber}
        qrCodeUrl={qrCodeUrl}
        upiId={upiId}
        merchantCode={merchantCode}
        onPaymentSuccess={onPaymentSuccess}
      />
    );
  }

  const getPaymentInfo = () => {
    switch (paymentMethod) {
      case 'esewa':
        return {
          name: 'eSewa',
          color: 'bg-green-500',
          instructions: 'You will be redirected to eSewa to complete your payment.'
        };
      case 'khalti':
        return {
          name: 'Khalti',
          color: 'bg-purple-600',
          instructions: 'You will be redirected to Khalti to complete your payment.'
        };
      case 'paypal':
        return {
          name: 'PayPal',
          color: 'bg-blue-600',
          instructions: 'You will be redirected to PayPal to complete your payment securely.'
        };
      case 'card':
        return {
          name: 'Card Payment',
          color: 'bg-gray-800',
          instructions: 'Enter your card details to complete the payment.'
        };
      case 'upi':
        return {
          name: 'UPI Payment',
          color: 'bg-indigo-600',
          instructions: 'Scan QR code with your UPI app'
        };
      case 'phonepe':
        return {
          name: 'PhonePe',
          color: 'bg-purple-600',
          instructions: 'Scan QR code with PhonePe app'
        };
      case 'fonepay':
        return {
          name: 'Fonepay',
          color: 'bg-blue-500',
          instructions: 'Scan QR code with your banking app'
        };
      default:
        return { name: 'Payment', color: 'bg-gray-500', instructions: '' };
    }
  };

  const paymentInfo = getPaymentInfo();
  const isInternational = paymentMethod === 'paypal' || paymentMethod === 'card';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 ${paymentInfo.color} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">
                {paymentInfo.name.charAt(0)}
              </span>
            </div>
            {paymentInfo.name} Payment
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {status === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Processing Payment</p>
                <p className="text-sm text-gray-500 mt-1">{paymentInfo.instructions}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isInternational ? `$${amountUSD.toFixed(2)} USD` : `Rs. ${amount.toLocaleString()}`}
                </p>
                {isInternational && (
                  <p className="text-xs text-gray-500 mt-1">
                    (Rs. {amount.toLocaleString()} NPR)
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Please do not close this window...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">Payment Successful!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your payment has been processed successfully.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-medium">{orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    {isInternational ? `$${amountUSD.toFixed(2)}` : `Rs. ${amount.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">Payment Failed</p>
                <p className="text-sm text-gray-500 mt-1">
                  Something went wrong with your payment. Please try again.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => setStatus('processing')} 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}