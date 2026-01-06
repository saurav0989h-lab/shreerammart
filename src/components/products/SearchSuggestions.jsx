import { Search, TrendingUp, Clock } from 'lucide-react';

export default function SearchSuggestions({ 
  query, 
  products, 
  categories,
  onSelect, 
  onClose 
}) {
  if (!query || query.length < 2) return null;

  const searchLower = query.toLowerCase();
  
  // Get matching products (max 5)
  const matchingProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.category_name?.toLowerCase().includes(searchLower)
    )
    .slice(0, 5);

  // Get matching categories
  const matchingCategories = categories
    .filter(c => c.name.toLowerCase().includes(searchLower))
    .slice(0, 3);

  if (matchingProducts.length === 0 && matchingCategories.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
      {/* Matching Categories */}
      {matchingCategories.length > 0 && (
        <div className="p-2 border-b">
          <p className="text-xs text-gray-500 px-2 mb-1">Categories</p>
          {matchingCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                onSelect({ type: 'category', value: cat.slug, label: cat.name });
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Matching Products */}
      {matchingProducts.length > 0 && (
        <div className="p-2">
          <p className="text-xs text-gray-500 px-2 mb-1">Products</p>
          {matchingProducts.map(product => (
            <button
              key={product.id}
              onClick={() => {
                onSelect({ type: 'product', value: product.name, label: product.name });
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-emerald-600">Rs. {(product.discount_price || product.base_price)?.toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}