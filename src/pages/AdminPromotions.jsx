import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Truck, Save, Eye, Megaphone, Image as ImageIcon, Plus, Upload, X, Edit, Trash2, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getDefaultFeatureCards, mergeHeroPromotionConfig, parseHeroPromotionSetting } from '@/lib/heroPromotionConfig';

export default function AdminPromotions() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch gallery images
  const { data: galleryImages = [], isLoading: loadingGallery } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: () => base44.entities.GalleryImage.list('-created_date'),
  });

  // Fetch promotion banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['promotion-banners'],
    queryFn: () => base44.entities.PromotionBanner.list('-created_date'),
  });

  // Fetch existing promotion settings (for hero section)
  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.SiteSettings.filter({ setting_key: 'hero_promotion' }),
  });

  const existingPromo = promotions[0];

  const defaultFeatureCards = useMemo(() => getDefaultFeatureCards(), []);

  const storedConfig = useMemo(
    () => parseHeroPromotionSetting(existingPromo?.setting_value),
    [existingPromo?.setting_value]
  );

  const currentConfig = useMemo(
    () => mergeHeroPromotionConfig(storedConfig),
    [storedConfig]
  );

  const [formData, setFormData] = useState(currentConfig);

  useEffect(() => {
    setFormData(currentConfig);
  }, [currentConfig]);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    display_order: 0,
    start_date: '',
    end_date: ''
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingPromo) {
        return base44.entities.SiteSettings.update(existingPromo.id, {
          setting_value: JSON.stringify(data)
        });
      } else {
        return base44.entities.SiteSettings.create({
          setting_key: 'hero_promotion',
          setting_value: JSON.stringify(data),
          description: 'Hero banner promotion settings'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['hero-promotion'] });
      toast.success('Promotion saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save promotion: ' + error.message);
    }
  });

  const createBannerMutation = useMutation({
    mutationFn: (data) => base44.entities.PromotionBanner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-banners'] });
      toast.success('Banner created successfully!');
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to create banner: ' + error.message);
    }
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PromotionBanner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-banners'] });
      toast.success('Banner updated successfully!');
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to update banner: ' + error.message);
    }
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id) => base44.entities.PromotionBanner.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion-banners'] });
      toast.success('Banner deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete banner: ' + error.message);
    }
  });

  const uploadToGalleryMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.GalleryImage.create({
        image_url: file_url,
        title: file.name,
        description: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Image uploaded to gallery!');
    },
    onError: (error) => {
      toast.error('Failed to upload image: ' + error.message);
    }
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryImage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast.success('Image deleted from gallery!');
    },
    onError: (error) => {
      toast.error('Failed to delete image: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureCardChange = (index, field, value) => {
    setFormData(prev => {
      const cards = (prev.featureCards && Array.isArray(prev.featureCards) && prev.featureCards.length)
        ? prev.featureCards.map(card => ({ ...card }))
        : defaultFeatureCards.map(card => ({ ...card }));

      if (!cards[index]) {
        return { ...prev, featureCards: cards };
      }

      cards[index] = {
        ...cards[index],
        [field]: value,
      };

      return {
        ...prev,
        featureCards: cards,
      };
    });
  };

  const openDialog = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerFormData({
        title: banner.title || '',
        description: banner.description || '',
        image_url: banner.image_url || '',
        link_url: banner.link_url || '',
        is_active: banner.is_active !== false,
        display_order: banner.display_order || 0,
        start_date: banner.start_date || '',
        end_date: banner.end_date || ''
      });
    } else {
      setEditingBanner(null);
      setBannerFormData({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        is_active: true,
        display_order: banners.length,
        start_date: '',
        end_date: ''
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingBanner(null);
  };

  const handleBannerChange = (field, value) => {
    setBannerFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      await uploadToGalleryMutation.mutateAsync(file);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const selectGalleryImage = (imageUrl) => {
    setBannerFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  const handleDeleteGalleryImage = (e, imageId) => {
    e.stopPropagation();
    if (window.confirm('Delete this image from gallery?')) {
      deleteGalleryImageMutation.mutate(imageId);
    }
  };

  const handleBannerSubmit = (e) => {
    e.preventDefault();
    
    if (!bannerFormData.title) {
      toast.error('Banner title is required!');
      return;
    }
    
    if (!bannerFormData.image_url) {
      toast.error('Please select or upload an image!');
      return;
    }

    if (editingBanner) {
      updateBannerMutation.mutate({
        id: editingBanner.id,
        data: bannerFormData
      });
    } else {
      createBannerMutation.mutate(bannerFormData);
    }
  };

  const handleDeleteBanner = (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteBannerMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Promotion Manager</h1>
                  <p className="text-gray-600">Manage promotional banners and hero section</p>
                </div>
              </div>
            </div>
          </div>

          {/* Currently Running Banners Status */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                Currently Running on Website
              </CardTitle>
              <CardDescription className="text-green-700">These banners are actively displayed on your homepage</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const now = new Date();
                const runningBanners = banners.filter(banner => {
                  if (!banner.is_active) return false;
                  if (banner.start_date && new Date(banner.start_date) > now) return false;
                  if (banner.end_date && new Date(banner.end_date) < now) return false;
                  return true;
                });

                if (runningBanners.length === 0) {
                  return (
                    <div className="text-center py-6 bg-white rounded-lg border border-green-200">
                      <Megaphone className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">No banners are currently running</p>
                      <p className="text-sm text-gray-500 mt-1">Create and activate banners to display them on your homepage</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {runningBanners.map((banner) => {
                      const timeRemaining = banner.end_date 
                        ? Math.ceil((new Date(banner.end_date) - now) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <div key={banner.id} className="bg-white p-4 rounded-lg border border-green-200 flex items-center gap-4">
                          <img 
                            src={banner.image_url} 
                            alt={banner.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{banner.title}</h4>
                            {banner.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{banner.description}</p>
                            )}
                            {timeRemaining !== null && (
                              <p className="text-xs text-green-700 mt-1">
                                {timeRemaining > 0 
                                  ? `Ends in ${timeRemaining} day${timeRemaining > 1 ? 's' : ''} (${new Date(banner.end_date).toLocaleDateString()})`
                                  : 'Ends today'}
                              </p>
                            )}
                            {!banner.end_date && (
                              <p className="text-xs text-blue-600 mt-1">Running indefinitely</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                              ● Live
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Promotion Banners Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Promotion Banners
                  </CardTitle>
                  <CardDescription>Manage promotional banner images displayed on the site</CardDescription>
                </div>
                <Button
                  onClick={() => openDialog()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No promotional banners yet</p>
                  <Button
                    onClick={() => openDialog()}
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Banner
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banners.map((banner) => {
                    const isExpired = banner.end_date && new Date(banner.end_date) < new Date();
                    const isScheduled = banner.start_date && new Date(banner.start_date) > new Date();
                    const isCurrentlyActive = banner.is_active && !isExpired && !isScheduled;

                    return (
                      <div
                        key={banner.id}
                        className={`relative group rounded-lg overflow-hidden border-2 bg-white hover:shadow-lg transition-all ${
                          isCurrentlyActive ? 'border-green-500' : 'border-gray-200'
                        }`}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                          {!banner.is_active && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-semibold bg-gray-900 px-3 py-1 rounded-full text-sm">Inactive</span>
                            </div>
                          )}
                          {isExpired && banner.is_active && (
                            <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                              <span className="text-white font-semibold bg-red-700 px-3 py-1 rounded-full text-sm">Expired</span>
                            </div>
                          )}
                          {isScheduled && banner.is_active && (
                            <div className="absolute inset-0 bg-blue-500/60 flex items-center justify-center">
                              <span className="text-white font-semibold bg-blue-700 px-3 py-1 rounded-full text-sm">Scheduled</span>
                            </div>
                          )}
                          {isCurrentlyActive && (
                            <div className="absolute top-2 right-2">
                              <span className="text-white font-semibold bg-green-600 px-3 py-1 rounded-full text-xs shadow-lg">● Active</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{banner.title}</h3>
                          {banner.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{banner.description}</p>
                          )}
                          {(banner.start_date || banner.end_date) && (
                            <div className="text-xs text-gray-500 mb-2 space-y-0.5">
                              {banner.start_date && (
                                <div>Start: {new Date(banner.start_date).toLocaleDateString()}</div>
                              )}
                              {banner.end_date && (
                                <div>End: {new Date(banner.end_date).toLocaleDateString()}</div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDialog(banner)}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Content Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Main Promotion Content
                </CardTitle>
                <CardDescription>Customize your hero banner text and messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="badge">Promotion Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => handleChange('badge', e.target.value)}
                    placeholder="🎉 New Year Sale 2026"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Small badge text at the top</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Main Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Get Fresh Groceries"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="highlightText">Highlighted Text</Label>
                    <Input
                      id="highlightText"
                      value={formData.highlightText}
                      onChange={(e) => handleChange('highlightText', e.target.value)}
                      placeholder="Delivered to Your Door"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Shop from the best local stores..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between border border-purple-100 rounded-lg p-4 bg-purple-50/40">
                  <div>
                    <Label htmlFor="showPopup" className="text-sm font-semibold text-gray-800">
                      Show Homepage Promotion Popup
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Display a dismissible promotion alert to visitors after updates.
                    </p>
                  </div>
                  <Switch
                    id="showPopup"
                    checked={formData.showPopup !== false}
                    onCheckedChange={(checked) => handleChange('showPopup', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  Feature Highlights
                </CardTitle>
                <CardDescription>Three feature boxes displayed below the main content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Feature 1 */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-purple-900 mb-3">Feature 1</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="feature1Text" className="text-xs">Main Text</Label>
                      <Input
                        id="feature1Text"
                        value={formData.feature1Text}
                        onChange={(e) => handleChange('feature1Text', e.target.value)}
                        placeholder="FREE Delivery"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature1Subtext" className="text-xs">Subtext</Label>
                      <Input
                        id="feature1Subtext"
                        value={formData.feature1Subtext}
                        onChange={(e) => handleChange('feature1Subtext', e.target.value)}
                        placeholder="On orders over Rs. 500"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-pink-900 mb-3">Feature 2</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="feature2Text" className="text-xs">Main Text</Label>
                      <Input
                        id="feature2Text"
                        value={formData.feature2Text}
                        onChange={(e) => handleChange('feature2Text', e.target.value)}
                        placeholder="SAME DAY"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature2Subtext" className="text-xs">Subtext</Label>
                      <Input
                        id="feature2Subtext"
                        value={formData.feature2Subtext}
                        onChange={(e) => handleChange('feature2Subtext', e.target.value)}
                        placeholder="Fast Delivery"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-orange-900 mb-3">Feature 3</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="feature3Text" className="text-xs">Main Text</Label>
                      <Input
                        id="feature3Text"
                        value={formData.feature3Text}
                        onChange={(e) => handleChange('feature3Text', e.target.value)}
                        placeholder="COD"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature3Subtext" className="text-xs">Subtext</Label>
                      <Input
                        id="feature3Subtext"
                        value={formData.feature3Subtext}
                        onChange={(e) => handleChange('feature3Subtext', e.target.value)}
                        placeholder="Payment Available"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Image Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Background Image
                </CardTitle>
                <CardDescription>Select a background image from your gallery for the hero section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Gallery Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-gray-900">Select from Gallery</h4>
                    <span className="text-xs text-gray-500">{galleryImages.length} images</span>
                  </div>
                  
                  {loadingGallery ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  ) : galleryImages.length === 0 ? (
                    <div className="text-center py-8">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No images in gallery yet</p>
                      <p className="text-xs text-gray-500 mt-1">Upload images in the Banner Gallery section above</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                      {galleryImages.map((image) => (
                        <div
                          key={image.id}
                          onClick={() => handleChange('backgroundImage', image.image_url)}
                          className={`relative group aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            formData.backgroundImage === image.image_url
                              ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-2'
                              : 'border-gray-200 hover:border-purple-400'
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={image.title || 'Gallery image'}
                            className="w-full h-full object-cover"
                          />
                          {formData.backgroundImage === image.image_url && (
                            <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Image Preview */}
                {formData.backgroundImage && (
                  <div className="relative">
                    <Label className="text-sm text-gray-600 mb-2 block">Selected Background Image</Label>
                    <img 
                      src={formData.backgroundImage} 
                      alt="Background preview" 
                      className="w-full h-40 object-cover rounded-lg border-2 border-purple-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('backgroundImage', '')}
                      className="absolute top-8 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      title="Clear background image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">Leave empty for gradient background only</p>
              </CardContent>
            </Card>

            {/* Homepage Feature Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  Homepage Feature Cards
                </CardTitle>
                <CardDescription>Update the four highlight cards shown beside the homepage banner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {formData.featureCards?.length ? (
                  formData.featureCards.map((card, index) => (
                    <div
                      key={card.id || index}
                      className="border border-purple-100 bg-white rounded-xl p-4 lg:p-5 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        <div className="lg:w-56 w-full">
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-dashed border-purple-200 bg-purple-50">
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={card.title || 'Feature card image'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Select an image below
                              </div>
                            )}
                            {card.image && (
                              <button
                                type="button"
                                onClick={() => handleFeatureCardChange(index, 'image', '')}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md"
                                title="Clear image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Current image preview</p>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <Label className="text-sm text-gray-700">Card Title</Label>
                            <Input
                              value={card.title}
                              onChange={(e) => handleFeatureCardChange(index, 'title', e.target.value)}
                              placeholder="Fresh Vegetables"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-700">Card Subtitle</Label>
                            <Input
                              value={card.subtitle}
                              onChange={(e) => handleFeatureCardChange(index, 'subtitle', e.target.value)}
                              placeholder="Daily Fresh Stock ✨"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-700">Select Image from Gallery</Label>
                            {loadingGallery ? (
                              <div className="flex justify-center py-6">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                              </div>
                            ) : galleryImages.length === 0 ? (
                              <p className="text-xs text-gray-500 mt-2">
                                Upload images in the banner gallery above to choose from.
                              </p>
                            ) : (
                              <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
                                {galleryImages.map((image) => (
                                  <button
                                    type="button"
                                    key={image.id}
                                    onClick={() => handleFeatureCardChange(index, 'image', image.image_url)}
                                    className={`relative shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                      card.image === image.image_url
                                        ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-1'
                                        : 'border-gray-200 hover:border-purple-400'
                                    }`}
                                  >
                                    <img
                                      src={image.image_url}
                                      alt={image.title || 'Gallery image'}
                                      className="w-full h-full object-cover"
                                    />
                                    {card.image === image.image_url && (
                                      <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                        <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center">
                                          <Check className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500 py-6 border border-dashed border-purple-200 rounded-lg bg-purple-50/30">
                    Add gallery images above to customize the homepage feature cards.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-6 bg-white p-4 rounded-xl shadow-lg border">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('/', '_blank')}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Live
              </Button>
            </div>
          </form>

          {/* Banner Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? 'Edit Promotion Banner' : 'Add Promotion Banner'}
                </DialogTitle>
                <DialogDescription>
                  {editingBanner
                    ? 'Update the banner details, image, and schedule below.'
                    : 'Create a new promotional banner to display on your website. Upload an image from the gallery and set the display schedule.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleBannerSubmit} className="space-y-4">
            {/* Banner Title */}
            <div>
              <Label htmlFor="banner-title">Banner Title *</Label>
              <Input
                id="banner-title"
                value={bannerFormData.title}
                onChange={(e) => handleBannerChange('title', e.target.value)}
                placeholder="e.g., Summer Sale 2026"
                required
                className="mt-1"
              />
            </div>

            {/* Banner Description */}
            <div>
              <Label htmlFor="banner-description">Description</Label>
              <Textarea
                id="banner-description"
                value={bannerFormData.description}
                onChange={(e) => handleBannerChange('description', e.target.value)}
                placeholder="Optional description for the banner"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Banner Image *</Label>
              
              {/* File Upload */}
              <div>
                <label className="block">
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-all cursor-pointer bg-gray-50 hover:bg-purple-50">
                    {uploadingImage ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Uploading to gallery...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="text-purple-600 font-semibold">Click to upload</span> to gallery
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Gallery Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-900">Image Gallery</h4>
                  <span className="text-xs text-gray-500">{galleryImages.length} images</span>
                </div>
                
                {loadingGallery ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No images in gallery yet</p>
                    <p className="text-xs text-gray-500 mt-1">Upload images above to add them</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {galleryImages.map((image) => (
                      <div
                        key={image.id}
                        className={`relative group aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          bannerFormData.image_url === image.image_url
                            ? 'border-purple-600 ring-2 ring-purple-600 ring-offset-2'
                            : 'border-gray-200 hover:border-purple-400'
                        }`}
                      >
                        <div onClick={() => selectGalleryImage(image.image_url)} className="w-full h-full">
                          <img
                            src={image.image_url}
                            alt={image.title || 'Gallery image'}
                            className="w-full h-full object-cover"
                          />
                          {bannerFormData.image_url === image.image_url && (
                            <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center pointer-events-none">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteGalleryImage(e, image.id)}
                          className="absolute top-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                          title="Delete from gallery"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Image Preview */}
              {bannerFormData.image_url && (
                <div className="relative">
                  <Label className="text-sm text-gray-600 mb-2 block">Selected Image Preview</Label>
                  <img
                    src={bannerFormData.image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleBannerChange('image_url', '')}
                    className="absolute top-8 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Link URL */}
            <div>
              <Label htmlFor="link-url">Link URL (Optional)</Label>
              <Input
                id="link-url"
                value={bannerFormData.link_url}
                onChange={(e) => handleBannerChange('link_url', e.target.value)}
                placeholder="e.g., /Products?category=sale"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Where users will be redirected when clicking the banner</p>
            </div>

            {/* Banner Duration */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <Label className="text-base font-semibold text-blue-900">Banner Duration (Optional)</Label>
              <p className="text-sm text-blue-700 mb-3">Set when this banner should be displayed</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={bannerFormData.start_date}
                    onChange={(e) => handleBannerChange('start_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm">End Date</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={bannerFormData.end_date}
                    onChange={(e) => handleBannerChange('end_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">Leave empty for permanent display. Banner will auto-activate/deactivate based on dates.</p>
            </div>

            {/* Display Order */}
            <div>
              <Label htmlFor="display-order">Display Order</Label>
              <Input
                id="display-order"
                type="number"
                value={bannerFormData.display_order}
                onChange={(e) => handleBannerChange('display_order', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="is-active" className="text-base font-semibold">Active Status</Label>
                <p className="text-sm text-gray-600">Show this banner on the website</p>
              </div>
              <Switch
                id="is-active"
                checked={bannerFormData.is_active}
                onCheckedChange={(checked) => handleBannerChange('is_active', checked)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBannerMutation.isPending || updateBannerMutation.isPending || !bannerFormData.image_url}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
