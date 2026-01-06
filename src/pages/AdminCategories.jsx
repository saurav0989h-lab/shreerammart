import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Menu, Plus, Edit, Trash2, Eye, EyeOff,
  GripVertical, Loader2, Package, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const unitTypes = ['kg', 'gram', 'liter', 'ml', 'piece', 'dozen', 'box', 'packet', 'set', 'unit'];

export default function AdminCategories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    icon: '',
    display_order: 0,
    is_visible: true,
    is_bulk_category: false
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    category_name: '',
    images: [],
    unit_type: 'piece',
    sell_by: 'item',
    base_price: '',
    discount_price: '',
    stock_quantity: '',
    is_visible: true
  });
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        // Sub-admins don't have access to categories
        navigate(createPageUrl('AdminDashboard'));
        return;
      }
      setUser(userData);
    };
    checkAuth();
  }, [navigate]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => base44.entities.Category.list('display_order'),
    enabled: !!user
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category created');
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category updated');
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created');
      closeProductDialog();
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated');
      closeProductDialog();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    }
  });

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const openDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image_url: category.image_url || '',
        icon: category.icon || '',
        display_order: category.display_order || 0,
        is_visible: category.is_visible !== false,
        is_bulk_category: category.is_bulk_category || false
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        icon: '',
        display_order: categories.length,
        is_visible: true,
        is_bulk_category: false
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'name' && !editingCategory) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleVisibility = (category) => {
    updateMutation.mutate({
      id: category.id,
      data: { is_visible: !category.is_visible }
    });
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getProductsByCategory = (categoryId) => {
    return products.filter(p => p.category_id === categoryId);
  };

  const openProductDialog = (category, product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || category.id,
        category_name: product.category_name || category.name,
        images: product.images || [],
        unit_type: product.unit_type || 'piece',
        sell_by: product.sell_by || 'item',
        base_price: product.base_price?.toString() || '',
        discount_price: product.discount_price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        is_visible: product.is_visible !== false
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        description: '',
        category_id: category.id,
        category_name: category.name,
        images: [],
        unit_type: 'piece',
        sell_by: 'item',
        base_price: '',
        discount_price: '',
        stock_quantity: '',
        is_visible: true
      });
    }
    setImageUrl('');
    setProductDialogOpen(true);
  };

  const closeProductDialog = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductChange = (field, value) => {
    setProductFormData(prev => ({ ...prev, [field]: value }));
  };

  const addProductImage = () => {
    if (imageUrl && !productFormData.images.includes(imageUrl)) {
      setProductFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      setImageUrl('');
    }
  };

  const removeProductImage = (index) => {
    setProductFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...productFormData,
      base_price: parseFloat(productFormData.base_price) || 0,
      discount_price: productFormData.discount_price ? parseFloat(productFormData.discount_price) : null,
      stock_quantity: parseInt(productFormData.stock_quantity) || 0
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b sticky top-0 z-10 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Categories</h1>
          </div>
          <Button onClick={() => openDialog()} className="bg-emerald-600 hover:bg-emerald-700 h-9 sm:h-10 text-sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Category</span>
          </Button>
        </header>

        <div className="p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm w-10 sm:w-12"></th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Category</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Products</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Status</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const categoryProducts = getProductsByCategory(category.id);
                      const isExpanded = expandedCategories[category.id];

                      return (
                        <Fragment key={category.id}>
                          <tr className="border-t hover:bg-gray-50">
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <button
                                onClick={() => toggleExpand(category.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                )}
                              </button>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                {category.image_url ? (
                                  <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{category.name}</p>
                                  <p className="text-xs text-gray-500 font-mono truncate">{category.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <Badge variant="outline" className="text-xs">{categoryProducts.length}</Badge>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <button
                                onClick={() => toggleVisibility(category)}
                                className={`flex items-center gap-1 text-xs sm:text-sm ${category.is_visible ? 'text-green-600' : 'text-gray-400'}`}
                              >
                                {category.is_visible ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span className="hidden sm:inline">{category.is_visible ? 'Visible' : 'Hidden'}</span>
                              </button>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openProductDialog(category)}
                                  className="text-emerald-600 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Product</span>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => openDialog(category)} className="h-7 sm:h-8">
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    if (confirm('Delete this category?')) {
                                      deleteMutation.mutate(category.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Products */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="bg-gray-50 p-4">
                                {categoryProducts.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500">
                                    <p>No products in this category</p>
                                    <Button
                                      size="sm"
                                      className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => openProductDialog(category)}
                                    >
                                      <Plus className="w-4 h-4 mr-1" /> Add First Product
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categoryProducts.map(product => (
                                      <div
                                        key={product.id}
                                        className="bg-white rounded-lg p-3 flex items-center gap-3 border"
                                      >
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                          {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <Package className="w-5 h-5 text-gray-300" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium truncate">{product.name}</p>
                                          <p className="text-sm text-emerald-600 font-medium">Rs. {product.base_price?.toLocaleString()}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge className={product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} variant="secondary">
                                              Stock: {product.stock_quantity || 0}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => openProductDialog(category, product)}>
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600"
                                            onClick={() => {
                                              if (confirm('Delete this product?')) {
                                                deleteProductMutation.mutate(product.id);
                                              }
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {categories.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No categories found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="mt-1 font-mono"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">Visible</Label>
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(v) => handleChange('is_visible', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">Bulk Category</Label>
                <Switch
                  checked={formData.is_bulk_category}
                  onCheckedChange={(v) => handleChange('is_bulk_category', v)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
              <span className="text-gray-500 font-normal ml-2">in {productFormData.category_name}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4 mt-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={productFormData.name}
                onChange={(e) => handleProductChange('name', e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={productFormData.description}
                onChange={(e) => handleProductChange('description', e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (Rs.) *</Label>
                <Input
                  type="number"
                  value={productFormData.base_price}
                  onChange={(e) => handleProductChange('base_price', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Sale Price (Rs.)</Label>
                <Input
                  type="number"
                  value={productFormData.discount_price}
                  onChange={(e) => handleProductChange('discount_price', e.target.value)}
                  className="mt-1"
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  value={productFormData.stock_quantity}
                  onChange={(e) => handleProductChange('stock_quantity', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Unit Type</Label>
                <Select value={productFormData.unit_type} onValueChange={(v) => handleProductChange('unit_type', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Sell By</Label>
                <Select value={productFormData.sell_by} onValueChange={(v) => handleProductChange('sell_by', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item">Per Item (piece, box, etc.)</SelectItem>
                    <SelectItem value="weight">By Weight (kg, gram)</SelectItem>
                    <SelectItem value="both">Both (customer chooses)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div>
              <Label>Product Image</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button type="button" onClick={addProductImage}>Add</Button>
              </div>
              {productFormData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {productFormData.images.map((img, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeProductImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label className="cursor-pointer">Visible to customers</Label>
              <Switch
                checked={productFormData.is_visible}
                onCheckedChange={(v) => handleProductChange('is_visible', v)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeProductDialog}>Cancel</Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {(createProductMutation.isPending || updateProductMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {editingProduct ? 'Update' : 'Add Product'}
              </Button>
            </div>
          </form>
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