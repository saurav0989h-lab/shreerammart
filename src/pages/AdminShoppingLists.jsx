import { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Search, CheckCircle, IndianRupee, Menu, Eye, CreditCard } from 'lucide-react';

// --- Sub-Component: Process Dialog (Isolated to prevent parent re-renders) ---
const ProcessOrderDialog = ({ isOpen, onClose, list, onQuote, onMarkPaid }) => {
  const [priceQuote, setPriceQuote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Sync state when the list changes
  useEffect(() => {
    if (isOpen && list) {
      setPriceQuote(list.estimated_total || '');
      setAdminNotes(list.admin_notes || '');
    }
  }, [isOpen, list]);

  const handleSubmit = () => {
    if (!priceQuote || isNaN(priceQuote)) {
      toast.error('Please enter a valid price');
      return;
    }
    onQuote(list.id, parseFloat(priceQuote), adminNotes);
  };

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process List: {list.customer_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Total Price Quote (Rs.)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                value={priceQuote}
                onChange={(e) => setPriceQuote(e.target.value)}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Admin Notes</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. All items found. Ready for delivery."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {/* Allow marking as paid manually if quote is already set */}
          {list.status === 'ready' && (
             <Button 
               variant="secondary" 
               className="mr-auto text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
               onClick={() => onMarkPaid(list)}
             >
               <CreditCard className="w-4 h-4 mr-2" /> Mark Paid Manually
             </Button>
          )}
          <Button variant="outline" onClick={() => onClose(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            {list.status === 'pending' ? 'Send Quote' : 'Update Quote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Sub-Component: Image Preview ---
const ImageViewer = ({ src, isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl p-1 bg-transparent border-none shadow-none text-white">
      <div className="relative">
        <img src={src} alt="Full preview" className="w-full h-auto rounded-lg" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onClose(false)} 
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
        >
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default function AdminShoppingLists() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [selectedList, setSelectedList] = useState(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  
  // Image Preview State
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate(createPageUrl('AdminLogin'));
        return;
      }
      const userData = await base44.auth.me();
      // Ensure role check is robust
      if (!['admin', 'subadmin'].includes(userData.role)) {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    };
    checkAuth();
  }, [navigate]);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['admin-shopping-lists'],
    queryFn: () => base44.entities.ShoppingList.list('-created_date', { 
        // Example: If base44 supports filtering at API level, do it here.
        // limit: 50 
    }),
    enabled: !!user
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shopping-lists']);
      toast.success('Shopping list updated successfully');
      setIsProcessDialogOpen(false);
    },
    onError: (err) => toast.error('Failed to update: ' + err.message)
  });

  const handleProcessQuote = (id, estimated_total, admin_notes) => {
    updateListMutation.mutate({
      id,
      data: {
        estimated_total,
        admin_notes,
        status: 'ready',
        updated_date: new Date().toISOString()
      }
    });
  };

  const handleMarkPaid = (list) => {
    // Usually good to use a UI confirmation, but standard confirm is OK for MVPs
    if (window.confirm(`Mark order for ${list.customer_name} as PAID?`)) {
      updateListMutation.mutate({
        id: list.id,
        data: { status: 'paid', updated_date: new Date().toISOString() }
      });
    }
  };

  const openProcessDialog = (list) => {
    setSelectedList(list);
    setIsProcessDialogOpen(true);
  };

  const filteredLists = lists.filter(list =>
    list.customer_phone?.includes(searchTerm) ||
    list.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.status?.includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 lg:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">Shopping List Requests</h1>
            </div>
            <div className="relative w-full max-w-xs md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4 max-w-6xl mx-auto">
              {filteredLists.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                filteredLists.map((list) => (
                  <div key={list.id} className="bg-white rounded-xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md">
                    <div className="p-4 lg:p-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-base lg:text-lg font-bold text-gray-900 truncate">
                            {list.customer_name || 'Anonymous User'}
                          </h3>
                          <p className="text-sm font-medium text-gray-600 font-mono">{list.customer_phone}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Requested: {new Date(list.created_date).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(list.status)} border shadow-none px-3 py-1`}>
                          {list.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                         {/* Text Content */}
                         {list.list_text ? (
                            <p className="whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed">
                                {list.list_text}
                            </p>
                         ) : (
                            <p className="text-sm text-gray-400 italic">No text provided</p>
                         )}

                         {/* Photo Grid */}
                         {list.list_photos?.length > 0 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                              {list.list_photos.map((photo, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPreviewImage(photo)}
                                    className="group relative flex-shrink-0"
                                >
                                    <img 
                                        src={photo} 
                                        alt="List item" 
                                        className="h-24 w-24 object-cover rounded-lg border shadow-sm group-hover:opacity-90 transition-opacity" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-opacity">
                                        <Eye className="w-6 h-6 text-white drop-shadow-md" />
                                    </div>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Footer / Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                        {list.estimated_total > 0 && (
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                            <span className="text-xs text-green-700 font-semibold uppercase">Quote:</span>
                            <span className="text-lg font-bold text-green-700">Rs. {list.estimated_total}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto justify-end">
                          {list.status === 'pending' && (
                            <Button onClick={() => openProcessDialog(list)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                              Quote & Approve
                            </Button>
                          )}

                          {list.status === 'ready' && (
                            <>
                              <Button 
                                variant="outline" 
                                onClick={() => openProcessDialog(list)} 
                                className="w-full sm:w-auto"
                              >
                                Edit Quote
                              </Button>
                              <Button 
                                onClick={() => handleMarkPaid(list)}
                                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                              >
                                <CreditCard className="w-4 h-4 mr-2" /> Mark Paid
                              </Button>
                            </>
                          )}

                          {list.status === 'paid' && (
                            <Button variant="outline" disabled className="bg-gray-50 w-full sm:w-auto">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Render Sub-Components */}
      <ProcessOrderDialog 
        isOpen={isProcessDialogOpen}
        onClose={setIsProcessDialogOpen}
        list={selectedList}
        onQuote={handleProcessQuote}
        onMarkPaid={(list) => {
            setIsProcessDialogOpen(false);
            handleMarkPaid(list);
        }}
      />

      <ImageViewer 
        src={previewImage} 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
      />
    </div>
  );
}