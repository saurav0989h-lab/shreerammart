import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Menu, Save, Upload, Loader2, Eye, EyeOff, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminPaymentSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showKeys, setShowKeys] = useState({});
  const [uploadingQR, setUploadingQR] = useState(null);
  const [settings, setSettings] = useState({
    esewa_enabled: false,
    esewa_merchant_id: '',
    esewa_secret_key: '',
    khalti_enabled: false,
    khalti_public_key: '',
    khalti_secret_key: '',
    phonepe_enabled: false,
    phonepe_merchant_id: '',
    phonepe_qr_code: '',
    upi_enabled: false,
    upi_id: '',
    upi_qr_code: '',
    fonepay_enabled: false,
    fonepay_merchant_code: '',
    fonepay_qr_code: '',
    paypal_enabled: false,
    paypal_client_id: '',
    paypal_secret: '',
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    cod_enabled: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(userData);
      } catch (e) {
        navigate(createPageUrl('AdminLogin'));
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: existingSettings } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const result = await base44.entities.PaymentSettings.list();
      return result[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings(existingSettings);
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings) {
        return await base44.entities.PaymentSettings.update(existingSettings.id, data);
      } else {
        return await base44.entities.PaymentSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast.success('Payment settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQRUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQR(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange(field, file_url);
      toast.success('QR code uploaded');
    } catch (error) {
      toast.error('Failed to upload QR code');
    } finally {
      setUploadingQR(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        currentPage="AdminPaymentSettings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Payment Settings</h1>
          </div>
        </header>

        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                Payment Gateway Configuration
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Configure payment methods for your store</p>
            </div>

            <Tabs defaultValue="local" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="local">Local Payments</TabsTrigger>
                <TabsTrigger value="international">International</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              {/* Local Payments */}
              <TabsContent value="local" className="space-y-4">
                {/* eSewa */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">eSewa</CardTitle>
                        <CardDescription>Nepal's most popular digital wallet</CardDescription>
                      </div>
                      <Switch
                        checked={settings.esewa_enabled}
                        onCheckedChange={(v) => handleChange('esewa_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.esewa_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Merchant ID</Label>
                        <Input
                          value={settings.esewa_merchant_id}
                          onChange={(e) => handleChange('esewa_merchant_id', e.target.value)}
                          placeholder="Enter eSewa merchant ID"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Secret Key</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type={showKeys.esewa ? 'text' : 'password'}
                            value={settings.esewa_secret_key}
                            onChange={(e) => handleChange('esewa_secret_key', e.target.value)}
                            placeholder="Enter eSewa secret key"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleShowKey('esewa')}
                          >
                            {showKeys.esewa ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Khalti */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Khalti</CardTitle>
                        <CardDescription>Digital wallet payment gateway</CardDescription>
                      </div>
                      <Switch
                        checked={settings.khalti_enabled}
                        onCheckedChange={(v) => handleChange('khalti_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.khalti_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Public Key</Label>
                        <Input
                          value={settings.khalti_public_key}
                          onChange={(e) => handleChange('khalti_public_key', e.target.value)}
                          placeholder="Enter Khalti public key"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Secret Key</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type={showKeys.khalti ? 'text' : 'password'}
                            value={settings.khalti_secret_key}
                            onChange={(e) => handleChange('khalti_secret_key', e.target.value)}
                            placeholder="Enter Khalti secret key"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleShowKey('khalti')}
                          >
                            {showKeys.khalti ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* PhonePe */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">PhonePe</CardTitle>
                        <CardDescription>UPI payment via PhonePe</CardDescription>
                      </div>
                      <Switch
                        checked={settings.phonepe_enabled}
                        onCheckedChange={(v) => handleChange('phonepe_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.phonepe_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Merchant ID</Label>
                        <Input
                          value={settings.phonepe_merchant_id}
                          onChange={(e) => handleChange('phonepe_merchant_id', e.target.value)}
                          placeholder="Enter PhonePe merchant ID"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>QR Code</Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQRUpload(e, 'phonepe_qr_code')}
                            className="hidden"
                            id="phonepe-qr"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('phonepe-qr').click()}
                            disabled={uploadingQR === 'phonepe_qr_code'}
                            className="w-full sm:w-auto"
                          >
                            {uploadingQR === 'phonepe_qr_code' ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload QR Code
                          </Button>
                          {settings.phonepe_qr_code && (
                            <div className="mt-3">
                              <img src={settings.phonepe_qr_code} alt="PhonePe QR" className="w-40 h-40 rounded-lg border" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* UPI */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">UPI / QR Code</CardTitle>
                        <CardDescription>Generic UPI payment</CardDescription>
                      </div>
                      <Switch
                        checked={settings.upi_enabled}
                        onCheckedChange={(v) => handleChange('upi_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.upi_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>UPI ID</Label>
                        <Input
                          value={settings.upi_id}
                          onChange={(e) => handleChange('upi_id', e.target.value)}
                          placeholder="yourname@bank"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>UPI QR Code</Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQRUpload(e, 'upi_qr_code')}
                            className="hidden"
                            id="upi-qr"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('upi-qr').click()}
                            disabled={uploadingQR === 'upi_qr_code'}
                            className="w-full sm:w-auto"
                          >
                            {uploadingQR === 'upi_qr_code' ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <QrCode className="w-4 h-4 mr-2" />
                            )}
                            Upload QR Code
                          </Button>
                          {settings.upi_qr_code && (
                            <div className="mt-3">
                              <img src={settings.upi_qr_code} alt="UPI QR" className="w-40 h-40 rounded-lg border" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Fonepay */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Fonepay</CardTitle>
                        <CardDescription>Nepal's digital payment system</CardDescription>
                      </div>
                      <Switch
                        checked={settings.fonepay_enabled}
                        onCheckedChange={(v) => handleChange('fonepay_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.fonepay_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Merchant Code</Label>
                        <Input
                          value={settings.fonepay_merchant_code}
                          onChange={(e) => handleChange('fonepay_merchant_code', e.target.value)}
                          placeholder="Enter Fonepay merchant code"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Fonepay QR Code</Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQRUpload(e, 'fonepay_qr_code')}
                            className="hidden"
                            id="fonepay-qr"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('fonepay-qr').click()}
                            disabled={uploadingQR === 'fonepay_qr_code'}
                            className="w-full sm:w-auto"
                          >
                            {uploadingQR === 'fonepay_qr_code' ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <QrCode className="w-4 h-4 mr-2" />
                            )}
                            Upload QR Code
                          </Button>
                          {settings.fonepay_qr_code && (
                            <div className="mt-3">
                              <img src={settings.fonepay_qr_code} alt="Fonepay QR" className="w-40 h-40 rounded-lg border" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Customers will scan this QR code and send payment confirmation screenshot
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              {/* International Payments */}
              <TabsContent value="international" className="space-y-4">
                {/* PayPal */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">PayPal</CardTitle>
                        <CardDescription>International payment gateway</CardDescription>
                      </div>
                      <Switch
                        checked={settings.paypal_enabled}
                        onCheckedChange={(v) => handleChange('paypal_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.paypal_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Client ID</Label>
                        <Input
                          value={settings.paypal_client_id}
                          onChange={(e) => handleChange('paypal_client_id', e.target.value)}
                          placeholder="Enter PayPal client ID"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Secret Key</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type={showKeys.paypal ? 'text' : 'password'}
                            value={settings.paypal_secret}
                            onChange={(e) => handleChange('paypal_secret', e.target.value)}
                            placeholder="Enter PayPal secret"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleShowKey('paypal')}
                          >
                            {showKeys.paypal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Stripe */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Stripe</CardTitle>
                        <CardDescription>Credit card & international payments</CardDescription>
                      </div>
                      <Switch
                        checked={settings.stripe_enabled}
                        onCheckedChange={(v) => handleChange('stripe_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                  {settings.stripe_enabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Publishable Key</Label>
                        <Input
                          value={settings.stripe_publishable_key}
                          onChange={(e) => handleChange('stripe_publishable_key', e.target.value)}
                          placeholder="pk_live_..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Secret Key</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type={showKeys.stripe ? 'text' : 'password'}
                            value={settings.stripe_secret_key}
                            onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                            placeholder="sk_live_..."
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleShowKey('stripe')}
                          >
                            {showKeys.stripe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              {/* Other */}
              <TabsContent value="other" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Cash on Delivery (COD)</CardTitle>
                        <CardDescription>Traditional payment method</CardDescription>
                      </div>
                      <Switch
                        checked={settings.cod_enabled}
                        onCheckedChange={(v) => handleChange('cod_enabled', v)}
                      />
                    </div>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}