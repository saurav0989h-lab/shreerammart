import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Menu, Search, Plus, Edit, Trash2, Eye, EyeOff,
  Star, Package, Loader2, X, Upload, Sparkles, Wand2, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const unitTypes = ['kg', 'gram', 'liter', 'ml', 'piece', 'dozen', 'box', 'packet', 'set', 'unit'];

export default function AdminProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
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
    min_order_qty: '1',
    is_bulk_only: false,
    is_visible: true,
    is_featured: false
  });
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: !!user
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('display_order'),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created');
      closeDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated');
      closeDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    }
  });

  const filteredProducts = products.filter(product => {
    const matchSearch = !search ||
      product.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        category_name: product.category_name || '',
        images: product.images || [],
        unit_type: product.unit_type || 'piece',
        sell_by: product.sell_by || 'item',
        base_price: product.base_price?.toString() || '',
        discount_price: product.discount_price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        min_order_qty: product.min_order_qty?.toString() || '1',
        is_bulk_only: product.is_bulk_only || false,
        is_visible: product.is_visible !== false,
        is_featured: product.is_featured || false
      });
    } else {
      setEditingProduct(null);
      setFormData({
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
        min_order_qty: '1',
        is_bulk_only: false,
        is_visible: true,
        is_featured: false
      });
    }
    setImageUrl('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      category_name: category?.name || ''
    }));
  };

  const addImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      setImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file_url]
      }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setGeneratingDescription(true);
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || 'general product';
      const prompt = `Generate a concise, appealing product description for an e-commerce store in Dang Valley, Nepal. 
      Product Name: ${formData.name}
      Category: ${categoryName}
      
      Write a 2-3 sentence description that highlights the product's quality, freshness (if applicable), and local sourcing. Keep it professional and customer-friendly. Focus on benefits and what makes this product special.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setFormData(prev => ({ ...prev, description: result }));
      toast.success('Description generated');
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateTags = async () => {
    if (!formData.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setGeneratingTags(true);
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || 'general product';
      const prompt = `Generate 5-8 relevant search keywords/tags for this product in an e-commerce store:
      Product Name: ${formData.name}
      Category: ${categoryName}
      ${formData.description ? `Description: ${formData.description}` : ''}
      
      Return only the tags as a JSON array of strings. Tags should be relevant for search optimization and include common terms customers might use.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            tags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setFormData(prev => ({ ...prev, tags: result.tags || [] }));
      toast.success('Tags generated');
    } catch (error) {
      toast.error('Failed to generate tags');
    } finally {
      setGeneratingTags(false);
    }
  };

  const generateProductImage = async () => {
    if (!formData.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setGeneratingImage(true);
    try {
      const categoryName = categories.find(c => c.id === formData.category_id)?.name || 'general product';
      const prompt = `High-quality product photograph of ${formData.name}, ${categoryName} category. Professional e-commerce product photo, clean white background, well-lit, detailed, appetizing (if food), commercial photography style, 4K quality, centered composition, sharp focus.`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: formData.images.length > 0 ? [formData.images[0]] : undefined
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      toast.success('Image generated');
    } catch (error) {
      toast.error('Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      base_price: parseFloat(formData.base_price) || 0,
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      min_order_qty: parseInt(formData.min_order_qty) || 1
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleVisibility = (product) => {
    updateMutation.mutate({
      id: product.id,
      data: { is_visible: !product.is_visible }
    });
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
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
          </div>
          <Button onClick={() => openDialog()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center gap-1">
                                {product.is_featured && (
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                )}
                                {product.is_bulk_only && (
                                  <Badge variant="outline" className="text-xs">Bulk Only</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{product.category_name}</td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium">Rs. {product.base_price?.toLocaleString()}</span>
                            {product.discount_price && (
                              <span className="text-green-600 text-sm ml-2">
                                Sale: Rs. {product.discount_price?.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">per {product.unit_type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {product.stock_quantity || 0}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleVisibility(product)}
                            className={`flex items-center gap-1 text-sm ${product.is_visible ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {product.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {product.is_visible ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openDialog(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Delete this product?')) {
                                  deleteMutation.mutate(product.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <Label>Description</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={generateDescription}
                    disabled={generatingDescription}
                    className="text-xs"
                  >
                    {generatingDescription ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Write or generate with AI..."
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit Type</Label>
                <Select value={formData.unit_type} onValueChange={(v) => handleChange('unit_type', v)}>
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
              <div>
                <Label>Sell By</Label>
                <Select value={formData.sell_by} onValueChange={(v) => handleChange('sell_by', v)}>
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
              <div>
                <Label>Base Price (Rs.) *</Label>
                <Input
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => handleChange('base_price', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Discount Price (Rs.)</Label>
                <Input
                  type="number"
                  value={formData.discount_price}
                  onChange={(e) => handleChange('discount_price', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => handleChange('stock_quantity', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Min Order Qty</Label>
                <Input
                  type="number"
                  value={formData.min_order_qty}
                  onChange={(e) => handleChange('min_order_qty', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Images</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={generateProductImage}
                  disabled={generatingImage}
                  className="text-xs"
                >
                  {generatingImage ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  AI Generate
                </Button>
              </div>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addImage}>Add URL</Button>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload').click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Search Tags & Keywords</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={generateTags}
                  disabled={generatingTags}
                  className="text-xs"
                >
                  {generatingTags ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  AI Suggest
                </Button>
              </div>
              <Input
                placeholder="Enter tags separated by commas"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="mt-1"
              />
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">Visible</Label>
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(v) => handleChange('is_visible', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">Featured</Label>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(v) => handleChange('is_featured', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">Bulk Only</Label>
                <Switch
                  checked={formData.is_bulk_only}
                  onCheckedChange={(v) => handleChange('is_bulk_only', v)}
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
                {editingProduct ? 'Update' : 'Create'}
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