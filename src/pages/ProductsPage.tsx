
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Grid3X3, List, Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import ProductUpdatesFeed from '@/components/ProductUpdatesFeed';

const ProductsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Mock products data
  const [products] = useState([
    {
      id: '1',
      title: 'AI Avatar Consultation',
      type: 'Virtual Meeting',
      description: 'Personalized AI avatar setup and customization session',
      price: 49.99,
      isFree: false,
      status: 'Published',
      thumbnail: '/placeholder.svg',
      createdAt: '2024-01-15',
      stats: { views: 124, bookings: 8 }
    },
    {
      id: '2',
      title: 'Voice Training Guide',
      type: 'Digital Product',
      description: 'Complete guide for training your AI avatar voice',
      price: 0,
      isFree: true,
      status: 'Published',
      thumbnail: '/placeholder.svg',
      createdAt: '2024-01-10',
      stats: { views: 89, downloads: 23 }
    },
    {
      id: '3',
      title: 'Premium Avatar Collection',
      type: 'Brand Collection',
      description: 'Exclusive collection of professional avatar styles',
      price: 99.99,
      isFree: false,
      status: 'Draft',
      thumbnail: '/placeholder.svg',
      createdAt: '2024-01-08',
      stats: { views: 45, inquiries: 12 }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hidden': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditProduct = (productId: string) => {
    console.log('Edit product:', productId);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
  };

  const handleViewStats = (productId: string) => {
    console.log('View stats for product:', productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your digital products, events, and collaborations
            </p>
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-slate-200/60">
            <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Products
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Recent Updates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            {/* View Controls */}
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">View:</span>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 px-3"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 px-3"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-medium">{products.length}</span>
                    <span>products total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onViewStats={handleViewStats}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="mt-6">
            <ProductUpdatesFeed />
          </TabsContent>
        </Tabs>

        {/* Add Product Modal */}
        <ProductForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(productData) => {
            console.log('Save product:', productData);
            setIsAddModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
