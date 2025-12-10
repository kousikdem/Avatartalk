import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Video } from 'lucide-react';
import { useVirtualProducts } from '@/hooks/useVirtualProducts';
import IntegrationBar from './virtual-collaboration/IntegrationBar';
import VirtualCollaborationStats from './virtual-collaboration/VirtualCollaborationStats';
import VirtualProductCard from './virtual-collaboration/VirtualProductCard';
import VirtualCollaborationCalendar from './virtual-collaboration/VirtualCollaborationCalendar';
import AddVirtualProductModal from './virtual-collaboration/AddVirtualProductModal';
import { toast } from 'sonner';

const VirtualCollaborationPage = () => {
  const { products, bookings, integrations, loading, stats, createProduct, updateProduct, deleteProduct, saveIntegrations } = useVirtualProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnectGoogle = () => {
    toast.info('Google OAuth integration - Configure in Supabase Dashboard');
    saveIntegrations({ google_connected: true, google_email: 'demo@gmail.com' });
  };

  const handleConnectZoom = () => {
    toast.info('Zoom OAuth integration - Configure in Supabase Dashboard');
    saveIntegrations({ zoom_connected: true, zoom_email: 'demo@zoom.us' });
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    await saveIntegrations({ calendar_sync_enabled: true, last_sync_at: new Date().toISOString() });
    setIsSyncing(false);
    toast.success('Calendar synced successfully!');
  };

  const handleSaveProduct = async (productData: any) => {
    if (editProduct) {
      await updateProduct(editProduct.id, productData);
    } else {
      await createProduct(productData);
    }
    setEditProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Virtual Collaboration
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage virtual meetings, events, and brand collaborations
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Virtual Product
          </Button>
        </div>

        {/* Integration Bar */}
        <IntegrationBar
          integrations={integrations}
          onConnectGoogle={handleConnectGoogle}
          onConnectZoom={handleConnectZoom}
          onSyncCalendar={handleSyncCalendar}
          isSyncing={isSyncing}
        />

        {/* Stats */}
        <VirtualCollaborationStats stats={stats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Your Virtual Products</h2>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                <Video className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-4">No virtual products yet</p>
                <Button onClick={() => setIsAddModalOpen(true)}>Create Your First Product</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <VirtualProductCard
                    key={product.id}
                    product={product}
                    onEdit={(p) => { setEditProduct(p); setIsAddModalOpen(true); }}
                    onDelete={deleteProduct}
                    onView={() => {}}
                    onDuplicate={async (p) => { await createProduct({ ...p, title: p.title + ' (Copy)', status: 'draft' }); }}
                    onToggleStatus={async (p) => { await updateProduct(p.id, { status: p.status === 'published' ? 'draft' : 'published' }); }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Calendar */}
          <VirtualCollaborationCalendar
            bookings={bookings}
            products={products}
            onSelectBooking={() => {}}
          />
        </div>

        {/* Add/Edit Modal */}
        <AddVirtualProductModal
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); setEditProduct(null); }}
          onSave={handleSaveProduct}
          editProduct={editProduct}
        />
      </div>
    </div>
  );
};

export default VirtualCollaborationPage;
