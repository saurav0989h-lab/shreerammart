import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ReplacementSelector({ 
  isOpen = false, 
  onClose = () => {},
  originalItem = {},
  availableProducts = [],
  onSelectReplacement = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'confirm'

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(product =>
      product.product_name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, availableProducts]);

  const getPriceComparison = () => {
    if (!selectedProduct || !originalItem) return null;
    const originalPrice = originalItem.price || originalItem.unit_price;
    const newPrice = selectedProduct.unit_price;
    const difference = newPrice - originalPrice;
    
    return {
      originalPrice,
      newPrice,
      difference,
      isHigher: difference > 0,
      isLower: difference < 0,
      isSame: difference === 0
    };
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setStep('confirm');
  };

  const handleConfirmReplacement = () => {
    if (selectedProduct && onSelectReplacement) {
      onSelectReplacement({
        original: originalItem,
        replacement: selectedProduct,
        priceComparison: getPriceComparison()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedProduct(null);
    setStep('select');
    onClose();
  };

  const priceComparison = getPriceComparison();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Replace Item</span>
            <span className="text-sm font-normal text-gray-500">
              {step === 'select' ? 'Select Replacement' : 'Confirm Replacement'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? `Find a replacement for ${originalItem?.name || 'this item'}`
              : 'Review price difference before confirming'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'select' ? (
            <>
              {/* Original Item Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Original Item:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{originalItem?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Quantity: {originalItem?.quantity} × Rs. {originalItem?.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      Rs. {((originalItem?.price || 0) * (originalItem?.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Products List */}
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="space-y-2 p-4">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <button
                        key={product.product_id}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 hover:border-emerald-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                              {product.stock > 0 ? (
                                <span className="text-xs text-emerald-600 font-medium">In Stock</span>
                              ) : (
                                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">
                              Rs. {product.unit_price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {product.description && `${product.description.substring(0, 30)}...`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mb-2 text-gray-400" />
                      <p>No products found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Price Comparison */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Original Item:</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{originalItem?.name}</span>
                    <span className="font-semibold">Rs. {originalItem?.price?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Replacement Item:</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{selectedProduct?.product_name}</span>
                    <span className="font-semibold">Rs. {selectedProduct?.unit_price?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Price Impact */}
                {priceComparison && !priceComparison.isSame && (
                  <div className={`rounded-lg p-4 border ${
                    priceComparison.isHigher 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-sm font-medium text-gray-700 mb-2">Price Impact:</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price Difference</span>
                      <span className={`font-bold text-lg ${
                        priceComparison.isHigher 
                          ? 'text-amber-600' 
                          : 'text-green-600'
                      }`}>
                        {priceComparison.isHigher ? '+' : ''}Rs. {Math.abs(priceComparison.difference).toLocaleString()}
                      </span>
                    </div>
                    {priceComparison.isHigher && (
                      <p className="text-xs text-amber-700 mt-2">
                        ⚠️ This item is Rs. {priceComparison.difference.toLocaleString()} more expensive
                      </p>
                    )}
                    {priceComparison.isLower && (
                      <p className="text-xs text-green-700 mt-2">
                        ✓ This item is Rs. {Math.abs(priceComparison.difference).toLocaleString()} cheaper
                      </p>
                    )}
                  </div>
                )}

                {priceComparison?.isSame && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">✓ Same price as original item</p>
                  </div>
                )}
              </div>

              {/* Confirmation Message */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  {priceComparison?.isHigher && (
                    `You&apos;ll pay Rs. ${priceComparison.difference.toLocaleString()} extra for this replacement.`
                  )}
                  {priceComparison?.isLower && (
                    `You&apos;ll save Rs. ${Math.abs(priceComparison.difference).toLocaleString()} with this replacement.`
                  )}
                  {priceComparison?.isSame && (
                    'Same price replacement'
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            {step === 'select' ? 'Cancel' : 'Back'}
          </Button>
          {step === 'select' ? (
            <Button disabled className="flex-1" variant="secondary">
              Select Product
            </Button>
          ) : (
            <Button 
              onClick={handleConfirmReplacement}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Replacement
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

ReplacementSelector.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  originalItem: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    quantity: PropTypes.number,
    price: PropTypes.number,
    unit_price: PropTypes.number
  }).isRequired,
  availableProducts: PropTypes.arrayOf(PropTypes.shape({
    product_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    product_name: PropTypes.string,
    unit_price: PropTypes.number,
    category: PropTypes.string,
    stock: PropTypes.number,
    description: PropTypes.string
  })).isRequired,
  onSelectReplacement: PropTypes.func.isRequired
};
