import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function QRPaymentModal({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  orderId,
  orderNumber,
  qrCodeUrl,
  upiId,
  merchantCode,
  onPaymentSuccess
}) {
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getPaymentInfo = () => {
    switch (paymentMethod) {
      case 'upi':
        return {
          name: 'UPI Payment',
          color: 'bg-indigo-600',
          instructions: 'Scan the QR code with any UPI app (PhonePe, Google Pay, Paytm) and upload payment screenshot'
        };
      case 'phonepe':
        return {
          name: 'PhonePe',
          color: 'bg-purple-600',
          instructions: 'Scan the PhonePe QR code and upload payment confirmation screenshot'
        };
      case 'fonepay':
        return {
          name: 'Fonepay',
          color: 'bg-blue-500',
          instructions: 'Scan the Fonepay QR code with your banking app and upload payment screenshot'
        };
      default:
        return { name: 'Payment', color: 'bg-gray-600', instructions: '' };
    }
  };

  const paymentInfo = getPaymentInfo();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setScreenshot(file_url);
      toast.success('Screenshot uploaded');
    } catch (error) {
      toast.error('Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setSubmitted(true);
    
    // Store payment proof with order
    const paymentProof = {
      screenshot_url: screenshot,
      transaction_id: transactionId,
      payment_method: paymentMethod,
      submitted_at: new Date().toISOString()
    };

    onPaymentSuccess({
      transactionId: transactionId || `PENDING-${Date.now()}`,
      method: paymentMethod,
      amount: amount,
      currency: 'NPR',
      paymentProof
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 ${paymentInfo.color} rounded-lg flex items-center justify-center`}>
              <QrCode className="w-5 h-5 text-white" />
            </div>
            {paymentInfo.name}
          </DialogTitle>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-6 py-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-700">{paymentInfo.instructions}</p>
            </div>

            {/* QR Code Display */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64 object-contain" />
                </div>
                {upiId && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">UPI ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">{upiId}</p>
                  </div>
                )}
                {merchantCode && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Merchant Code</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">{merchantCode}</p>
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Amount to Pay</p>
              <p className="text-3xl font-bold text-gray-900">Rs. {amount.toLocaleString()}</p>
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <div>
                <Label>Upload Payment Screenshot *</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="payment-screenshot"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('payment-screenshot').click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
                      </>
                    )}
                  </Button>
                  {screenshot && (
                    <div className="mt-3">
                      <img src={screenshot} alt="Payment proof" className="w-full h-40 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Transaction ID (Optional)</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction/reference ID"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!screenshot}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
            >
              Confirm Payment
            </Button>

            <p className="text-xs text-center text-gray-500">
              Your order will be confirmed once we verify your payment
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Payment Submitted!</p>
              <p className="text-sm text-gray-500 mt-1">
                We will verify your payment and confirm your order shortly
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Number</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">Rs. {amount.toLocaleString()}</span>
              </div>
            </div>
            <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}