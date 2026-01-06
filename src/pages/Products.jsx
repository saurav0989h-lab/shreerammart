import { useState, useMemo, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal, Sparkles, TrendingUp, Percent } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import SearchSuggestions from '@/components/products/SearchSuggestions';
import PriceRangeFilter from '@/components/products/PriceRangeFilter';

export default function Products() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const searchRef = useRef(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_visible: true }, 'display_order'),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_visible: true }),
  });

  // Calculate price range bounds from products
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 50000 };
    const prices = products.map(p => p.discount_price || p.base_price).filter(Boolean);
    return {
      min: 0,
      max: Math.ceil(Math.max(...prices) / 100) * 100
    };
  }, [products]);

  // Initialize price range when products load
  useEffect(() => {
    if (products.length > 0 && priceRange[1] === 50000) {
      setPriceRange([priceStats.min, priceStats.max]);
    }
  }, [priceStats, products.length, priceRange]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Search filter with relevance scoring
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered
        .map(p => {
          let score = 0;
          const name = p.name.toLowerCase();
          const desc = p.description?.toLowerCase() || '';
          const cat = p.category_name?.toLowerCase() || '';
          
          // Exact name match
          if (name === searchLower) score += 100;
          // Name starts with search
          else if (name.startsWith(searchLower)) score += 50;
          // Name contains search
          else if (name.includes(searchLower)) score += 30;
          // Category match
          if (cat.includes(searchLower)) score += 20;
          // Description match
          if (desc.includes(searchLower)) score += 10;
          
          return { ...p, relevanceScore: score };
        })
        .filter(p => p.relevanceScore > 0);
    }
    
    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        filtered = filtered.filter(p => p.category_id === category.id);
      }
    }
    
    // Price range filter
    filtered = filtered.filter(p => {
      const price = p.discount_price || p.base_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock_quantity > 0);
    }
    
    // On sale filter
    if (onSaleOnly) {
      filtered = filtered.filter(p => p.discount_price && p.discount_price < p.base_price);
    }
    
    // Sorting
    switch (sortBy) {
      case 'relevance':
        if (search) {
          filtered.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        } else {
          filtered.sort((a, b) => {
            // Featured first, then by popularity (could track views/orders)
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return new Date(b.created_date) - new Date(a.created_date);
          });
        }
        break;
      case 'popular':
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (b.stock_quantity || 0) - (a.stock_quantity || 0);
        });
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.discount_price || a.base_price) - (b.discount_price || b.base_price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discount_price || b.base_price) - (a.discount_price || a.base_price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [products, search, selectedCategory, sortBy, inStockOnly, onSaleOnly, priceRange, categories]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('relevance');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setPriceRange([priceStats.min, priceStats.max]);
  };

  const handleSuggestionSelect = (suggestion) => {
    if (suggestion.type === 'category') {
      setSelectedCategory(suggestion.value);
      setSearch('');
    } else {
      setSearch(suggestion.value);
    }
    setShowSuggestions(false);
  };

  const hasActiveFilters = search || selectedCategory !== 'all' || inStockOnly || onSaleOnly || 
    priceRange[0] > priceStats.min || priceRange[1] < priceStats.max;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-14 sm:top-16 md:top-20 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search with Suggestions */}
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products, categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 h-11 rounded-xl"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showSuggestions && (
                <SearchSuggestions
                  query={search}
                  products={products}
                  categories={categories}
                  onSelect={handleSuggestionSelect}
                  onClose={() => setShowSuggestions(false)}
                />
              )}
            </div>
            
            {/* Desktop filters */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3 overflow-x-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-11 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-11 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Relevance</span>
                  </SelectItem>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Popular</span>
                  </SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 px-3 h-11 bg-gray-100 rounded-xl">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={setInStockOnly}
                />
                <label htmlFor="in-stock" className="text-sm whitespace-nowrap cursor-pointer">In Stock</label>
              </div>

              <div className="flex items-center gap-2 px-3 h-11 bg-amber-50 rounded-xl border border-amber-200">
                <Checkbox
                  id="on-sale"
                  checked={onSaleOnly}
                  onCheckedChange={setOnSaleOnly}
                />
                <label htmlFor="on-sale" className="text-sm whitespace-nowrap cursor-pointer flex items-center gap-1">
                  <Percent className="w-3 h-3 text-amber-600" /> On Sale
                </label>
              </div>
            </div>

            {/* Mobile filter button */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="outline" className="h-10 sm:h-11 rounded-xl text-sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                  {hasActiveFilters && <Badge className="ml-2 bg-red-600 text-xs">Active</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <label className="font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full h-12 rounded-xl">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full h-12 rounded-xl">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <PriceRangeFilter
                      minPrice={priceStats.min}
                      maxPrice={priceStats.max}
                      value={priceRange}
                      onChange={setPriceRange}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
                      <Checkbox
                        id="in-stock-mobile"
                        checked={inStockOnly}
                        onCheckedChange={setInStockOnly}
                      />
                      <label htmlFor="in-stock-mobile" className="cursor-pointer">In Stock Only</label>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <Checkbox
                        id="on-sale-mobile"
                        checked={onSaleOnly}
                        onCheckedChange={setOnSaleOnly}
                      />
                      <label htmlFor="on-sale-mobile" className="cursor-pointer flex items-center gap-1">
                        <Percent className="w-4 h-4 text-amber-600" /> On Sale Only
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setFilterOpen(false)}>
                      Show {filteredProducts.length} Results
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {inStockOnly && (
                <Badge variant="secondary" className="gap-1">
                  In Stock
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </Badge>
              )}
              {onSaleOnly && (
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
                  On Sale
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setOnSaleOnly(false)} />
                </Badge>
              )}
              {(priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) && (
                <Badge variant="secondary" className="gap-1">
                  Rs. {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([priceStats.min, priceStats.max])} />
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="gap-1">
                  "{search}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            {isLoading ? 'Loading...' : `${filteredProducts.length} products found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} className="bg-red-600 hover:bg-red-700">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}