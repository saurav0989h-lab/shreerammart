import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut,
  ArrowRight, X, MessageSquare, MapPin, Truck, ChevronDown, ChevronRight, FolderOpen, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function AdminSidebar({ user, isOpen, onClose, pendingOrders = 0 }) {
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop();

  // Persist settings menu state in localStorage
  const [settingsOpen, setSettingsOpen] = useState(() => {
    const saved = localStorage.getItem('adminSettingsOpen');
    return saved === 'true';
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSettingsOpen', settingsOpen.toString());
  }, [settingsOpen]);

  const isSubAdmin = user?.role === 'subadmin';

  const navItems = [
    { name: 'Dashboard', page: 'AdminDashboard', icon: LayoutDashboard },
    { name: 'Orders', page: 'AdminOrders', icon: ShoppingBag, badge: pendingOrders },
    { name: 'Shopping Lists', page: 'AdminShoppingLists', icon: MessageSquare },
    { name: 'Products', page: 'AdminProducts', icon: Package },
    { name: 'Promotions', page: 'AdminPromotions', icon: Megaphone },
  ];

  const settingsItems = [
    { name: 'Categories', page: 'AdminCategories', icon: FolderOpen },
    { name: 'Store Locations', page: 'AdminStores', icon: MapPin },
    { name: 'Delivery Settings', page: 'AdminDeliverySettings', icon: Truck },
    { name: 'Payment Settings', page: 'AdminPaymentSettings', icon: Settings },
    { name: 'Reviews', page: 'AdminReviews', icon: MessageSquare },
    { name: 'Customers', page: 'AdminCustomers', icon: Users },
    { name: 'Admin Settings', page: 'AdminSettings', icon: Users },
  ];

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 lg:static ${isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        <Link to={createPageUrl('AdminDashboard')} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">D</span>
          </div>
          <span className="text-white font-bold">{isSubAdmin ? 'Sub-Admin Panel' : 'Admin Panel'}</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {navItems.map(item => (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentPage === item.page
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" /> {item.name}
            {item.badge > 0 && (
              <Badge className={`ml-auto ${item.badgeColor || 'bg-red-500'}`}>{item.badge}</Badge>
            )}
          </Link>
        ))}

        {/* Settings Group - Only for Admin */}
        {!isSubAdmin && (
          <div className="pt-2">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-400 hover:bg-gray-800 hover:text-white w-full"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
              {settingsOpen ? (
                <ChevronDown className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>

            {settingsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {settingsItems.map(item => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${currentPage === item.page
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <item.icon className="w-4 h-4" /> {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{user.full_name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{user.full_name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 mt-1">
            <ArrowRight className="w-4 h-4 mr-2" /> View Store
          </Button>
        </Link>
      </div>
    </aside>
  );
}