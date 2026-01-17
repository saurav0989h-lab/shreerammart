import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Menu, Save, Upload, Image as ImageIcon, Plus, Trash2, Loader2, X, Eye, EyeOff, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminHomepage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link_url: createPageUrl('Products'),
    highlight_text: '',
    button_text: 'Shop Now',
    display_order: 1,
    is_active: true,
    start_date: '',
    end_date: '',
    auto_slide_timer: 5000,
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          navigate(createPageUrl('AdminLogin'));
          return;
        }
        const userData = await base44.auth.me();
        if (userData?.role !== 'admin' && userData?.role !== 'subadmin') {
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

  // Fetch banners
  const { data: allBanners = [], isLoading } = useQuery({
    queryKey: ['homepage-banners'],
    queryFn: () => base44.entities.PromotionBanner.list('-created_date'),
  });

  useEffect(() => {
    setBanners(allBanners);
  }, [allBanners]);

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      setUploadingImage(true);
      try {
        // Upload via base44 - Use correct method path
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      } catch (error) {
        setUploadingImage(false);
        throw error;
      }
    },
    onSuccess: (url) => {
      setFormData(prev => ({ ...prev, image_url: url }));
      toast.success('Image uploaded successfully');
      setUploadingImage(false);
    },
    onError: (error) => {
      toast.error('Failed to upload image: ' + (error?.message || 'Unknown error'));
      setUploadingImage(false);
    }
  });

  // Save banner mutation
  const saveBannerMutation = useMutation({
    mutationFn: async (data) => {
      if (editingBannerId) {
        return await base44.entities.PromotionBanner.update(editingBannerId, data);
      } else {
        return await base44.entities.PromotionBanner.create(data);
      }
    },
    onSuccess: () => {
      toast.success(editingBannerId ? 'Banner updated successfully' : 'Banner created successfully');
      queryClient.invalidateQueries({ queryKey: ['homepage-banners'] });
      resetForm();
    },
    onError: (error) => {
      toast.error(editingBannerId ? 'Failed to update banner' : 'Failed to create banner');
      console.error(error);
    }
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (bannerId) => {
      return await base44.entities.PromotionBanner.delete(bannerId);
    },
    onSuccess: () => {
      toast.success('Banner deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['homepage-banners'] });
    },
    onError: () => {
      toast.error('Failed to delete banner');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link_url: createPageUrl('Products'),
      highlight_text: '',
      button_text: 'Shop Now',
      display_order: 1,
      is_active: true,
      start_date: '',
      end_date: '',
      auto_slide_timer: 5000,
    });
    setEditingBannerId(null);
  };

  const handleEditBanner = (banner) => {
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || createPageUrl('Products'),
      highlight_text: banner.highlight_text || '',
      button_text: banner.button_text || 'Shop Now',
      display_order: banner.display_order || 1,
      is_active: banner.is_active !== false,
      start_date: banner.start_date || '',
      end_date: banner.end_date || '',
      auto_slide_timer: banner.auto_slide_timer || 5000,
    });
    setEditingBannerId(banner.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      toast.error('Title and image are required');
      return;
    }
    saveBannerMutation.mutate(formData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Homepage Settings</h1>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          {/* Banner Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingBannerId ? 'Edit Banner' : 'Add New Banner'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label>Banner Image *</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {uploadingImage ? 'Uploading...' : 'Click to upload'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Banner Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Fresh Groceries"
                      className="mt-1"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g., Special Offer"
                      className="mt-1"
                    />
                  </div>

                  {/* Highlight Text */}
                  <div>
                    <Label htmlFor="highlight">Highlight Text</Label>
                    <Input
                      id="highlight"
                      value={formData.highlight_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight_text: e.target.value }))}
                      placeholder="e.g., 50% OFF"
                      className="mt-1"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.button_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                      placeholder="e.g., Shop Now"
                      className="mt-1"
                    />
                  </div>

                  {/* Link URL */}
                  <div>
                    <Label htmlFor="linkUrl">Button Link</Label>
                    <Input
                      id="linkUrl"
                      value={formData.link_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                      placeholder="e.g., /products"
                      className="mt-1"
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min="1"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Auto Slide Timer */}
                  <div>
                    <Label htmlFor="timer">Auto Slide Timer (ms)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="timer"
                        type="number"
                        min="1000"
                        step="500"
                        value={formData.auto_slide_timer}
                        onChange={(e) => setFormData(prev => ({ ...prev, auto_slide_timer: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <div className="text-xs text-gray-500 flex items-center">
                        {(formData.auto_slide_timer / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter banner description"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label className="mb-0">Active</Label>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={saveBannerMutation.isPending || uploadingImage}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saveBannerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingBannerId ? 'Update' : 'Create'} Banner
                      </>
                    )}
                  </Button>
                  {editingBannerId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Banners List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Banners ({banners.length})</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : banners.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-500">No banners created yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition">
                    {banner.image_url && (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 mb-1">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-600">{banner.subtitle}</p>
                        )}
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        {banner.highlight_text && (
                          <p className="text-purple-600 font-semibold">{banner.highlight_text}</p>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{(banner.auto_slide_timer / 1000).toFixed(1)}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {banner.is_active ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Eye className="w-4 h-4" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <EyeOff className="w-4 h-4" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBanner(banner)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBannerMutation.mutate(banner.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
