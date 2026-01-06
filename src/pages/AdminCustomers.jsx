import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Mail, Phone, Calendar, ShoppingBag, DollarSign, X, MessageSquare, Save, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminCustomers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [segment, setSegment] = useState('all');

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

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.User.list('-created_date'),
    enabled: !!user
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!user
  });

  // Calculate customer stats
  const getCustomerStats = (customerEmail) => {
    const customerOrders = orders.filter(o => o.customer_email === customerEmail);
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const completedOrders = customerOrders.filter(o => o.status === 'completed').length;
    return {
      totalOrders: customerOrders.length,
      totalSpent,
      completedOrders,
      lastOrderDate: customerOrders[0]?.created_date || null
    };
  };

  // Segment customers
  const segmentedCustomers = customers.filter(customer => {
    const stats = getCustomerStats(customer.email);
    
    if (segment === 'vip') return stats.totalSpent > 5000;
    if (segment === 'active') return stats.totalOrders > 0;
    if (segment === 'inactive') return stats.totalOrders === 0;
    return true;
  });

  // Search filter
  const filteredCustomers = segmentedCustomers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateNoteMutation = useMutation({
    mutationFn: async ({ customerId, note }) => {
      return await base44.entities.User.update(customerId, { admin_notes: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer note saved');
    }
  });

  const handleSaveNote = () => {
    if (selectedCustomer) {
      updateNoteMutation.mutate({
        customerId: selectedCustomer.id,
        note: adminNote
      });
    }
  };

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setAdminNote(customer.admin_notes || '');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        currentPage="AdminCustomers"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">Customer Management</h1>
          </div>
        </header>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total Customers</p>
                    <p className="text-xl sm:text-2xl font-bold">{customers.length}</p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold">
                      {customers.filter(c => getCustomerStats(c.email).totalOrders > 0).length}
                    </p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">VIP Customers</p>
                    <p className="text-2xl font-bold">
                      {customers.filter(c => getCustomerStats(c.email).totalSpent > 5000).length}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New This Month</p>
                    <p className="text-2xl font-bold">
                      {customers.filter(c => {
                        const created = new Date(c.created_date);
                        const now = new Date();
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  variant={segment === 'all' ? 'default' : 'outline'}
                  onClick={() => setSegment('all')}
                  className="whitespace-nowrap text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                >
                  All
                </Button>
                <Button
                  variant={segment === 'vip' ? 'default' : 'outline'}
                  onClick={() => setSegment('vip')}
                  className="whitespace-nowrap"
                >
                  VIP (Rs. 5000+)
                </Button>
                <Button
                  variant={segment === 'active' ? 'default' : 'outline'}
                  onClick={() => setSegment('active')}
                  className="whitespace-nowrap"
                >
                  Active
                </Button>
                <Button
                  variant={segment === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setSegment('inactive')}
                  className="whitespace-nowrap"
                >
                  Inactive
                </Button>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Customer</th>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Contact</th>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Orders</th>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Total Spent</th>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Segment</th>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Joined</th>
                    <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => {
                      const stats = getCustomerStats(customer.email);
                      return (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{customer.full_name}</p>
                              {customer.role === 'admin' && (
                                <Badge className="mt-1 bg-purple-100 text-purple-800">Admin</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-4 h-4" /> {customer.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">{stats.totalOrders}</p>
                            <p className="text-xs text-gray-500">{stats.completedOrders} completed</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">Rs. {stats.totalSpent.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            {stats.totalSpent > 5000 ? (
                              <Badge className="bg-amber-100 text-amber-800">VIP</Badge>
                            ) : stats.totalOrders > 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">New</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">
                              {new Date(customer.created_date).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openCustomerDetails(customer)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Customer Details</span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="notes">Admin Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{selectedCustomer.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <Badge className={selectedCustomer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                        {selectedCustomer.role}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined Date</p>
                      <p className="font-medium">{new Date(selectedCustomer.created_date).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const stats = getCustomerStats(selectedCustomer.email);
                        return (
                          <>
                            <div>
                              <p className="text-sm text-gray-600">Total Orders</p>
                              <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Spent</p>
                              <p className="text-2xl font-bold">Rs. {stats.totalSpent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Completed Orders</p>
                              <p className="text-2xl font-bold">{stats.completedOrders}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Customer Segment</p>
                              <p className="text-lg font-bold">
                                {stats.totalSpent > 5000 ? 'VIP' : stats.totalOrders > 0 ? 'Active' : 'New'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {orders.filter(o => o.customer_email === selectedCustomer.email).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter(o => o.customer_email === selectedCustomer.email)
                      .map(order => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">Order #{order.order_number}</p>
                                <p className="text-sm text-gray-600">{new Date(order.created_date).toLocaleString()}</p>
                                <p className="text-sm text-gray-600 mt-1">{order.items?.length || 0} items</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">Rs. {order.total_amount?.toLocaleString()}</p>
                                <Badge className={
                                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Admin Notes
                  </label>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add internal notes about this customer..."
                    rows={6}
                    className="mb-4"
                  />
                  <Button
                    onClick={handleSaveNote}
                    disabled={updateNoteMutation.isPending}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateNoteMutation.isPending ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}