import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu, X, Search, Check, Ban, Trash2, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/reviews/StarRating';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminReviews() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    };
    checkAuth();
  }, [navigate]);

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date'),
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Review.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review updated');
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted');
      setSelectedReview(null);
    },
  });

  const handleApprove = (review) => {
    updateReviewMutation.mutate({
      id: review.id,
      data: { ...review, is_approved: true }
    });
  };

  const handleReject = (review) => {
    updateReviewMutation.mutate({
      id: review.id,
      data: { ...review, is_approved: false }
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.product_name.toLowerCase().includes(search.toLowerCase()) ||
                         review.user_name.toLowerCase().includes(search.toLowerCase()) ||
                         review.comment.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'approved' && review.is_approved) ||
                         (filterStatus === 'pending' && !review.is_approved);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.is_approved).length,
    pending: reviews.filter(r => !r.is_approved).length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        currentPage="AdminReviews"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Reviews Management</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Reviews</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Avg Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-blue-700">{stats.avgRating}</p>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className={`${filterStatus === 'all' ? 'bg-red-600 hover:bg-red-700' : ''} h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4`}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('approved')}
                  className={filterStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Approved
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  className={filterStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                  Pending
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{review.product_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{review.user_name}</div>
                        <div className="text-xs text-gray-500">{review.user_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StarRating rating={review.rating} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">{review.comment}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(review.created_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!review.is_approved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(review)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {review.is_approved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(review)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-semibold">{selectedReview.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <StarRating rating={selectedReview.rating} size="lg" />
              </div>
              {selectedReview.title && (
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Review</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReview.comment}</p>
              </div>
              {selectedReview.images?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Photos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedReview.images.map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {!selectedReview.is_approved ? (
                  <Button
                    onClick={() => {
                      handleApprove(selectedReview);
                      setSelectedReview(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleReject(selectedReview);
                      setSelectedReview(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Ban className="w-4 h-4 mr-2" /> Unapprove
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => deleteReviewMutation.mutate(selectedReview.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}