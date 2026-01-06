import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, ShoppingBag, Package, Settings, LogOut,
  TrendingUp, Clock, Truck, ArrowRight,
  Menu, X, MessageSquare, MapPin, FileText, DollarSign, AlertCircle, Calendar, Check,
  Users, Eye, MousePointer, Activity, ShoppingCart, UserPlus, Star, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      const userData = await base44.auth.me();
      if (userData.role !== 'admin' && userData.role !== 'subadmin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    };
    checkAuth();
  }, [navigate]);

  // Fetch real orders data
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!user
  });

  // Fetch products data
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: !!user
  });

  // Fetch users data
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.users.list('-created_date'),
    enabled: !!user
  });

  // Fetch reviews data
  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date'),
    enabled: !!user
  });

  // Website Traffic Analytics (Mock data - in production, use analytics service)
  const getWebsiteAnalytics = () => {
    // Get from localStorage or generate mock data
    const storedAnalytics = localStorage.getItem('website_analytics');
    if (storedAnalytics) {
      return JSON.parse(storedAnalytics);
    }

    // Generate and store mock analytics
    const analytics = {
      totalVisits: Math.floor(Math.random() * 5000) + 2000,
      uniqueVisitors: Math.floor(Math.random() * 3000) + 1000,
      pageViews: Math.floor(Math.random() * 15000) + 5000,
      avgSessionDuration: Math.floor(Math.random() * 300) + 120, // seconds
      bounceRate: (Math.random() * 30 + 25).toFixed(1), // percentage
      todayVisits: Math.floor(Math.random() * 500) + 100,
      topPages: [
        { page: '/Products', views: Math.floor(Math.random() * 2000) + 500 },
        { page: '/Home', views: Math.floor(Math.random() * 1500) + 400 },
        { page: '/Cart', views: Math.floor(Math.random() * 1000) + 300 },
        { page: '/Checkout', views: Math.floor(Math.random() * 800) + 200 },
        { page: '/About', views: Math.floor(Math.random() * 500) + 100 }
      ],
      deviceBreakdown: {
        mobile: Math.floor(Math.random() * 60) + 30,
        desktop: Math.floor(Math.random() * 40) + 20,
        tablet: Math.floor(Math.random() * 20) + 10
      }
    };
    localStorage.setItem('website_analytics', JSON.stringify(analytics));
    return analytics;
  };

  const analytics = getWebsiteAnalytics();

  // Member Activity Stats
  const totalMembers = users.length;
  const newMembersToday = users.filter(u => {
    const userDate = new Date(u.created_date);
    const today = new Date();
    return userDate.toDateString() === today.toDateString();
  }).length;
  
  const newMembersThisWeek = users.filter(u => {
    const userDate = new Date(u.created_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return userDate >= weekAgo;
  }).length;

  const activeMembers = users.filter(u => {
    // Consider active if they have orders in last 30 days
    const userOrders = orders.filter(o => o.customer_email === u.email || o.customer_phone === u.phone);
    if (userOrders.length === 0) return false;
    const lastOrderDate = new Date(Math.max(...userOrders.map(o => new Date(o.created_date))));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastOrderDate >= thirtyDaysAgo;
  }).length;

  // Product Performance
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_visible).length;
  const featuredProducts = products.filter(p => p.is_featured).length;
  const outOfStockProducts = products.filter(p => (p.stock_quantity || 0) === 0).length;

  // Review Stats
  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;

  // Calculate real stats from orders
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.created_date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;
  
  const productsCount = totalProducts;

  // Calculate real revenue from completed orders
  const completedOrders = orders.filter(o => o.status === 'completed' || o.payment_status === 'completed');
  const totalRevenueNPR = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Conversion Rate (orders / unique visitors)
  const conversionRate = analytics.uniqueVisitors > 0 
    ? ((orders.length / analytics.uniqueVisitors) * 100).toFixed(2)
    : 0;

  // Average Order Value
  const avgOrderValue = orders.length > 0
    ? (totalRevenueNPR / orders.length).toFixed(0)
    : 0;

  // Mock international revenue for now (you can add a currency field to orders later)
  const internationalRevenueUSD = 0; // Will be calculated from orders with currency === 'USD'
  const usdToNprRate = 133.5;
  const internationalRevenueNPR = internationalRevenueUSD * usdToNprRate;
  const domesticRevenueNPR = totalRevenueNPR - internationalRevenueNPR;

  // Calculate refund stats
  const refundedOrders = orders.filter(o => o.status === 'refunded' || o.refund_status === 'processed').length;
  const totalRefundAmount = orders.filter(o => o.status === 'refunded' || o.refund_status === 'processed')
    .reduce((sum, order) => sum + (order.refund_amount || 0), 0);
  const refundedToday = orders.filter(o => {
    if (!o.refund_date) return false;
    const refundDate = new Date(o.refund_date);
    const today = new Date();
    return refundDate.toDateString() === today.toDateString() && (o.status === 'refunded' || o.refund_status === 'processed');
  }).length;
  const pendingRefundRequests = orders.filter(o => o.refund_request_status === 'pending').length;
  // Get recent orders for display
  const recentOrders = orders.slice(0, 5);

  // Selected date summary
  const isSameDay = (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };
  const selectedDateObj = new Date(selectedDate);
  const completedOnSelectedDate = orders.filter(o => (o.status === 'completed' || o.payment_status === 'completed') && isSameDay(o.created_date, selectedDateObj)).length;
  const revenueOnSelectedDate = orders
    .filter(o => (o.status === 'completed' || o.payment_status === 'completed') && isSameDay(o.created_date, selectedDateObj))
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const refundedOnSelectedDate = orders
    .filter(o => (o.status === 'refunded' || o.refund_status === 'processed') && o.refund_date && isSameDay(o.refund_date, selectedDateObj))
    .length;

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  if (!user) return <div className="p-10">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pendingOrders={pendingOrders}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Website Traffic Analytics */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Website Traffic</CardTitle>
                      <CardDescription>Visitor analytics and engagement metrics</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('website_analytics');
                      window.location.reload();
                    }}
                    className="text-xs"
                  >
                    Refresh Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{analytics.totalVisits.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 font-medium">Total Visits</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{analytics.uniqueVisitors.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 font-medium">Unique Visitors</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <MousePointer className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{analytics.pageViews.toLocaleString()}</p>
                    <p className="text-xs text-green-600 font-medium">Page Views</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                    <Activity className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-900">{Math.floor(analytics.avgSessionDuration / 60)}m {analytics.avgSessionDuration % 60}s</p>
                    <p className="text-xs text-orange-600 font-medium">Avg. Session</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-teal-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-teal-900">{conversionRate}%</p>
                    <p className="text-xs text-teal-600 font-medium">Conversion Rate</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-900">₨{avgOrderValue}</p>
                    <p className="text-xs text-indigo-600 font-medium">Avg. Order Value</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Top Pages
                    </h4>
                    <div className="space-y-2">
                      {analytics.topPages.map((page, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{page.page}</span>
                          <span className="font-semibold text-gray-900">{page.views.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Device Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">📱 Mobile</span>
                          <span className="font-semibold">{analytics.deviceBreakdown.mobile}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${analytics.deviceBreakdown.mobile}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">💻 Desktop</span>
                          <span className="font-semibold">{analytics.deviceBreakdown.desktop}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${analytics.deviceBreakdown.desktop}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">📲 Tablet</span>
                          <span className="font-semibold">{analytics.deviceBreakdown.tablet}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${analytics.deviceBreakdown.tablet}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Activity Stats */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Member Activity</CardTitle>
                    <CardDescription>User registration and engagement statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{totalMembers}</p>
                    <p className="text-xs text-green-600 font-medium">Total Members</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{activeMembers}</p>
                    <p className="text-xs text-blue-600 font-medium">Active (30d)</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <UserPlus className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{newMembersToday}</p>
                    <p className="text-xs text-purple-600 font-medium">New Today</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-900">{newMembersThisWeek}</p>
                    <p className="text-xs text-orange-600 font-medium">New This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product & Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Product Stats</CardTitle>
                      <CardDescription>Inventory overview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xl font-bold text-purple-900">{totalProducts}</p>
                      <p className="text-xs text-purple-600">Total Products</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xl font-bold text-green-900">{activeProducts}</p>
                      <p className="text-xs text-green-600">Active</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-xl font-bold text-amber-900">{featuredProducts}</p>
                      <p className="text-xs text-amber-600">Featured</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-xl font-bold text-red-900">{outOfStockProducts}</p>
                      <p className="text-xs text-red-600">Out of Stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Review Stats</CardTitle>
                      <CardDescription>Customer feedback overview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-xl font-bold text-amber-900">{totalReviews}</p>
                      <p className="text-xs text-amber-600">Total Reviews</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-green-600 fill-green-600" />
                        <p className="text-xl font-bold text-green-900">{avgRating}</p>
                      </div>
                      <p className="text-xs text-green-600">Avg. Rating</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg col-span-2">
                      <p className="text-xl font-bold text-blue-900">{pendingReviews}</p>
                      <p className="text-xs text-blue-600">Pending Approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Summary */}
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-700" />
                  <p className="font-semibold text-gray-900">Daily Summary</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-9 border rounded px-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Completed on date</p>
                        <p className="text-2xl font-bold text-green-700">{completedOnSelectedDate}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Earnings on date (NPR)</p>
                        <p className="text-2xl font-bold text-emerald-700 truncate">₨{revenueOnSelectedDate.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Refunded on date</p>
                        <p className="text-2xl font-bold text-orange-700">{refundedOnSelectedDate}</p>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-orange-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Pending Orders</p>
                      <p className="text-2xl sm:text-3xl font-bold text-amber-600">{pendingOrders}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Original Stats Cards */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Today's Orders</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{todayOrders}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Total Revenue (NPR)</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 truncate">₨{totalRevenueNPR.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Products</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{productsCount}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Refund Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Total Refunded</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">{refundedOrders}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Refund Amount (NPR)</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 truncate">₨{totalRefundAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Refunded Today</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{refundedToday}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Pending Refund Requests</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">{pendingRefundRequests}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Domestic Revenue (NPR)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600">₨{domesticRevenueNPR.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Local payments in Nepali Rupees</p>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-400">{((domesticRevenueNPR / totalRevenueNPR) * 100).toFixed(1)}% of total revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>International Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-purple-600">₨{internationalRevenueNPR.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Converted from international payments</p>
                    <div className="pt-2 border-t space-y-1">
                      <p className="text-xs text-gray-600">${internationalRevenueUSD} USD received</p>
                      <p className="text-xs text-gray-400">Conversion rate: ₨{usdToNprRate}/USD</p>
                      <p className="text-xs text-gray-400">{((internationalRevenueNPR / totalRevenueNPR) * 100).toFixed(1)}% of total revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
                <Link to={createPageUrl('AdminOrders')}>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">All</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                {/* Desktop Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Order</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-sm">{order.order_number}</td>
                          <td className="py-3 px-4 text-sm">
                            <p>{order.customer_name}</p>
                          </td>
                          <td className="py-3 px-4 font-medium text-sm">Rs. {order.total_amount?.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge className={`text-xs ${statusColors[order.status] || 'bg-gray-100'}`}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {new Date(order.created_date).toDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}