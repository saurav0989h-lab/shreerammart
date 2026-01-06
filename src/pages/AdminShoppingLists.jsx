import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Search, CheckCircle, XCircle, Clock, DollarSign, Image } from 'lucide-react';

export default function AdminShoppingLists() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [priceQuote, setPriceQuote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all lists
  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['admin-shopping-lists'],
    queryFn: () => base44.entities.ShoppingList.list('-created_date'),
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shopping-lists']);
      toast.success('Shopping list updated successfully');
      setIsDialogOpen(false);
    },
    onError: (err) => toast.error('Failed to update list: ' + err.message)
  });

  const filteredLists = lists.filter(list =>
    list.customer_phone?.includes(searchTerm) ||
    list.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.status?.includes(searchTerm)
  );

  const handleProcess = (list) => {
    setSelectedList(list);
    setPriceQuote(list.estimated_total || '');
    setAdminNotes(list.admin_notes || '');
    setIsDialogOpen(true);
  };

  const handleSubmitQuote = () => {
    if (!priceQuote || isNaN(priceQuote)) {
      toast.error('Please enter a valid price');
      return;
    }

    updateListMutation.mutate({
      id: selectedList.id,
      data: {
        estimated_total: parseFloat(priceQuote),
        admin_notes: adminNotes,
        status: 'ready', // Mark as ready for payment
        updated_date: new Date().toISOString()
      }
    });
  };

  const handleMarkPaid = (list) => {
    if (confirm('Mark this list as PAID manually?')) {
      updateListMutation.mutate({
        id: list.id,
        data: { status: 'paid', updated_date: new Date().toISOString() }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'sent_to_checkout': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping List Requests</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search phone, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredLists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
              <p className="text-gray-500">No shopping lists found.</p>
            </div>
          ) : (
            filteredLists.map((list) => (
              <div key={list.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row gap-6">
                {/* List Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{list.customer_name || 'Anonymous user'}</h3>
                      <p className="text-sm text-gray-500">{list.customer_phone}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(list.created_date).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(list.status)}>
                      {list.status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{list.list_text || 'No text content'}</p>
                  </div>

                  {list.list_photos?.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {list.list_photos.map((photo, i) => (
                        <img key={i} src={photo} alt="List item" className="h-20 w-20 object-cover rounded-md border" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="md:w-72 flex flex-col gap-3 justify-center border-l pl-6">
                  {list.estimated_total > 0 && (
                    <div className="text-right mb-2">
                      <span className="text-sm text-gray-500">Quoted Price:</span>
                      <p className="text-2xl font-bold text-green-600">Rs. {list.estimated_total}</p>
                    </div>
                  )}

                  {list.status === 'pending' && (
                    <Button onClick={() => handleProcess(list)} className="w-full bg-blue-600 hover:bg-blue-700">
                      Quote Price & Approve
                    </Button>
                  )}

                  {list.status === 'ready' && (
                    <Button variant="outline" className="w-full border-green-200 bg-green-50 text-green-700 cursor-default">
                      Waiting for User Payment
                    </Button>
                  )}

                  {list.status === 'ready' && (
                    <Button variant="ghost" size="sm" onClick={() => handleProcess(list)} className="w-full text-xs text-gray-400">
                      Edit Quote
                    </Button>
                  )}

                  {list.status === 'paid' && (
                    <Button variant="outline" className="w-full border-indigo-200 bg-indigo-50 text-indigo-700 cursor-default">
                      <CheckCircle className="w-4 h-4 mr-2" /> Paid
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Process Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Shopping List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Total Price Quote (Rs.)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
              <label className="text-sm font-medium mb-1 block">Admin Notes (visible to user)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. All items found. Ready for delivery."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitQuote} className="bg-green-600 hover:bg-green-700">
              Set Price & Mark Ready
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}