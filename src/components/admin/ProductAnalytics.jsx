import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, Package, AlertTriangle, 
  DollarSign, ShoppingCart, BarChart3, Calendar, Percent
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, subWeeks, subMonths, isAfter, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ProductAnalytics({ orders, products, categories }) {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onSaleFilter, setOnSaleFilter] = useState('all');

  // Calculate date filter
  const dateFilter = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '7days': return subDays(now, 7);
      case '30days': return subDays(now, 30);
      case '3months': return subMonths(now, 3);
      case '6months': return subMonths(now, 6);
      case '1year': return subMonths(now, 12);
      default: return subDays(now, 30);
    }
  }, [dateRange]);

  // Filter orders by date
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.status === 'completed' && 
      isAfter(new Date(o.created_date), dateFilter)
    );
  }, [orders, dateFilter]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }
    
    if (onSaleFilter === 'on_sale') {
      filtered = filtered.filter(p => p.discount_price && p.discount_price < p.base_price);
    } else if (onSaleFilter === 'regular') {
      filtered = filtered.filter(p => !p.discount_price || p.discount_price >= p.base_price);
    }
    
    return filtered;
  }, [products, selectedCategory, onSaleFilter]);

  // Calculate product sales metrics
  const productMetrics = useMemo(() => {
    const metrics = {};
    
    filteredProducts.forEach(p => {
      metrics[p.id] = {
        product: p,
        totalQuantity: 0,
        totalRevenue: 0,
        orderCount: 0
      };
    });

    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (metrics[item.product_id]) {
          metrics[item.product_id].totalQuantity += item.quantity || 0;
          metrics[item.product_id].totalRevenue += item.total_price || 0;
          metrics[item.product_id].orderCount += 1;
        }
      });
    });

    return Object.values(metrics);
  }, [filteredProducts, filteredOrders]);

  // Top selling by quantity
  const topByQuantity = useMemo(() => {
    return [...productMetrics]
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
  }, [productMetrics]);

  // Top selling by revenue
  const topByRevenue = useMemo(() => {
    return [...productMetrics]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [productMetrics]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return filteredProducts
      .filter(p => p.stock_quantity <= 10)
      .sort((a, b) => a.stock_quantity - b.stock_quantity)
      .slice(0, 10);
  }, [filteredProducts]);

  // Sales trend over time
  const salesTrend = useMemo(() => {
    const trend = {};
    const getKey = (date) => {
      if (dateRange === '7days') return format(date, 'EEE');
      if (dateRange === '30days') return format(date, 'MMM d');
      return format(date, 'MMM yyyy');
    };

    filteredOrders.forEach(order => {
      const key = getKey(new Date(order.created_date));
      if (!trend[key]) {
        trend[key] = { date: key, sales: 0, revenue: 0, orders: 0 };
      }
      order.items?.forEach(item => {
        if (filteredProducts.find(p => p.id === item.product_id)) {
          trend[key].sales += item.quantity || 0;
          trend[key].revenue += item.total_price || 0;
        }
      });
      trend[key].orders += 1;
    });

    return Object.values(trend);
  }, [filteredOrders, filteredProducts, dateRange]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const dist = {};
    productMetrics.forEach(pm => {
      const catName = pm.product.category_name || 'Uncategorized';
      if (!dist[catName]) {
        dist[catName] = { name: catName, value: 0 };
      }
      dist[catName].value += pm.totalRevenue;
    });
    return Object.values(dist).filter(d => d.value > 0);
  }, [productMetrics]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = productMetrics.reduce((sum, pm) => sum + pm.totalRevenue, 0);
    const totalQuantity = productMetrics.reduce((sum, pm) => sum + pm.totalQuantity, 0);
    const avgOrderValue = filteredOrders.length > 0 
      ? totalRevenue / filteredOrders.length 
      : 0;
    const lowStockCount = lowStockProducts.length;
    const outOfStock = filteredProducts.filter(p => p.stock_quantity === 0).length;

    return { totalRevenue, totalQuantity, avgOrderValue, lowStockCount, outOfStock };
  }, [productMetrics, filteredOrders, lowStockProducts, filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-500" />
              <Select value={onSaleFilter} onValueChange={setOnSaleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="on_sale">On Sale</SelectItem>
                  <SelectItem value="regular">Regular Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold">Rs. {summaryStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Units Sold</p>
                <p className="text-lg font-bold">{summaryStats.totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Order Value</p>
                <p className="text-lg font-bold">Rs. {Math.round(summaryStats.avgOrderValue).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Low Stock</p>
                <p className="text-lg font-bold">{summaryStats.lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Out of Stock</p>
                <p className="text-lg font-bold">{summaryStats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Units Sold'
                  ]}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" name="Units Sold" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No sales data for selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top by Quantity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products by Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            {topByQuantity.filter(t => t.totalQuantity > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topByQuantity.filter(t => t.totalQuantity > 0).slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="product.name" 
                    width={120} 
                    fontSize={11}
                    tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                  />
                  <Tooltip formatter={(value) => [value, 'Units Sold']} />
                  <Bar dataKey="totalQuantity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No sales data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topByRevenue.filter(t => t.totalRevenue > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topByRevenue.filter(t => t.totalRevenue > 0).slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} />
                  <YAxis 
                    type="category" 
                    dataKey="product.name" 
                    width={120} 
                    fontSize={11}
                    tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                  />
                  <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="totalRevenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No revenue data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No category data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-auto">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category_name}</p>
                      </div>
                    </div>
                    <Badge className={product.stock_quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                      {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>All products well stocked!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Units Sold</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Orders</th>
                </tr>
              </thead>
              <tbody>
                {productMetrics
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .slice(0, 15)
                  .map(pm => (
                  <tr key={pm.product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {pm.product.images?.[0] ? (
                            <img src={pm.product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-sm">{pm.product.name}</span>
                        {pm.product.discount_price && pm.product.discount_price < pm.product.base_price && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">Sale</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{pm.product.category_name || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={
                        pm.product.stock_quantity === 0 ? 'bg-red-100 text-red-800' :
                        pm.product.stock_quantity <= 10 ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {pm.product.stock_quantity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{pm.totalQuantity}</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600">
                      Rs. {pm.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500">{pm.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}