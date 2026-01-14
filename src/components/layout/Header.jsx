import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShoppingCart, Menu, Phone, MapPin, User, LogOut, Globe, Search, Heart, Package, Percent, Sparkles, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/components/ui/CartContext';
import { useWishlist } from '@/components/ui/WishlistContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ListUploadForm from '@/components/checkout/ListUploadForm';

export default function Header({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shoppingListDialogOpen, setShoppingListDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const nextLanguage = language === 'en' ? 'np' : (language === 'np' ? 'hi' : 'en');
  const nextLanguageLabel = { en: 'English', np: 'नेपाली', hi: 'हिन्दी' }[nextLanguage];

  const navLinks = [
    { name: t('home'), path: 'Home', icon: Sparkles },
    { name: t('products'), path: 'Products', icon: Package },
    { name: t('deals') || 'Deals', path: 'Products', icon: Percent, query: '?sale=true' },
    { name: t('trackOrder'), path: 'OrderTracking', icon: MapPin },
    { name: t('myLists') || 'My Lists', path: 'MyShoppingLists', icon: Heart },
  ];

  const isActive = (path) => {
    const currentPage = location.pathname.split('/').pop() || 'Home';
    return currentPage === path;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl('Products') + '?search=' + encodeURIComponent(searchQuery));
      setSearchQuery('');
    }
  };

  const handleMobileShoppingListOpen = () => {
    setMobileOpen(false);
    setShoppingListDialogOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <Dialog open={shoppingListDialogOpen} onOpenChange={setShoppingListDialogOpen}>
        {/* Top bar */}
        <div className="hidden md:block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs xl:text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 hover:scale-105 transition-transform">
                <MapPin className="w-3.5 h-3.5" /> {t('servingDang')}
              </span>
              <span className="flex items-center gap-2 hover:scale-105 transition-transform">
                <Phone className="w-3.5 h-3.5" /> +977-9844988588
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Free Delivery over Rs. 1500
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 hover:bg-white/20 px-3 py-1 rounded-full transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                {nextLanguageLabel}
              </button>
              {user?.role === 'admin' && (
                <Link to={createPageUrl('AdminDashboard')} className="underline hover:bg-white/20 px-3 py-1 rounded-full transition-all">
                  {t('adminPanel')}
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <span className="text-white font-black text-xl sm:text-2xl tracking-tight">SR</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-black text-base sm:text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent leading-tight">shreerammart</h1>
                <p className="text-[10px] text-gray-500 font-medium">{t('localDelivery')}</p>
              </div>
            </Link>

            {/* Search Bar - Desktop/Tablet */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full group flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                <Input
                  type="text"
                  placeholder={t('searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 rounded-full border-2 border-gray-200 hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-300 shadow-sm hover:shadow-md font-medium text-sm"
                />
              </div>
            </form>

            {/* Right side Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 mr-2">
                {navLinks.slice(0, 3).map(link => (
                  <Link
                    key={`${link.path}${link.query || link.name}`}
                    to={createPageUrl(link.path) + (link.query || '')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive(link.path)
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Wishlist */}
              <Link to={createPageUrl('UserProfile')}>
                <Button variant="ghost" size="icon" className="relative hover:bg-pink-50 hover:text-pink-600 transition-all h-10 w-10">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pink-600">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Shopping Lists */}
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative hover:bg-emerald-50 hover:text-emerald-600 transition-all h-10 px-3"
                >
                  <ListChecks className="w-5 h-5" />
                  <span className="hidden md:inline font-medium text-sm">
                    {t('shoppingLists') || 'Shopping Lists'}
                  </span>
                </Button>
              </DialogTrigger>

              {/* Cart */}
              <Link to={createPageUrl('Cart')}>
                <Button variant="ghost" size="icon" className="relative hover:bg-purple-50 hover:text-purple-600 transition-all h-11 w-11 hover:scale-110">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg animate-bounce">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu - Desktop */}
              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to={createPageUrl('UserProfile')}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user.first_name || user.full_name}</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={onLogout} className="h-9 w-9 hover:bg-red-50 hover:text-red-600" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to={createPageUrl('Login')}>
                    <Button variant="ghost" size="sm">
                      {t('login') || 'Login'}
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Signup')}>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white hover:shadow-lg transition-all">
                      {t('signup') || 'Sign Up'}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                  <div className="flex flex-col h-full">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder={t('searchProducts')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 rounded-full"
                        />
                      </div>
                    </form>

                    <div className="py-4 border-b">
                      <h2 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">shreerammart</h2>
                      <p className="text-sm text-gray-500">{t('localDelivery')}</p>
                    </div>

                    <nav className="flex-1 py-6 space-y-2">
                      {navLinks.map(link => (
                        <Link
                          key={`${link.path}${link.query || link.name}`}
                          to={createPageUrl(link.path) + (link.query || '')}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all ${
                            isActive(link.path)
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.name}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleMobileShoppingListOpen}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all text-gray-600 hover:bg-gray-100"
                      >
                        <ListChecks className="w-5 h-5" />
                        {t('shoppingLists') || 'Shopping Lists'}
                      </button>

                      <Link
                        to={createPageUrl('UserProfile')}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all text-gray-600 hover:bg-gray-100"
                      >
                        <User className="w-5 h-5" />
                        {t('myAccount')}
                      </Link>

                      {user ? (
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout ({user.first_name})
                        </button>
                      ) : (
                        <>
                          <Link
                            to={createPageUrl('Login')}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all text-gray-600 hover:bg-gray-100"
                          >
                            <User className="w-5 h-5" />
                            Login
                          </Link>
                          <Link
                            to={createPageUrl('Signup')}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          >
                            <Sparkles className="w-5 h-5" />
                            Sign Up
                          </Link>
                        </>
                      )}
                    </nav>

                    <div className="py-6 border-t space-y-3">
                      <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:bg-purple-50 w-full py-2 px-3 rounded-lg transition-all"
                      >
                        <Globe className="w-4 h-4" />
                        {`Switch to ${nextLanguageLabel}`}
                      </button>
                      <div className="flex items-center gap-2 text-sm text-gray-600 px-3">
                        <Phone className="w-4 h-4" /> +977-9844988588
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 px-3">
                        <MapPin className="w-4 h-4" /> Dang, Nepal
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 rounded-full border-2 focus:border-purple-600"
                />
              </div>
            </form>
          </div>
        </div>

        <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ListChecks className="w-6 h-6 text-purple-600" />
              Manage Shopping Lists
            </DialogTitle>
            <DialogDescription>
              Review your saved lists or submit a new list for quick grocery planning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                asChild
                variant="secondary"
                className="bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                <Link to={createPageUrl('MyShoppingLists')} onClick={() => setShoppingListDialogOpen(false)}>
                  <ListChecks className="w-4 h-4" />
                  View My Lists
                </Link>
              </Button>
            </div>
            <ListUploadForm onListSubmit={() => setShoppingListDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}