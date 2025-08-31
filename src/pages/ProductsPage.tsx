
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Grid3X3, List, Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import ProductUpdatesFeed from '@/components/ProductUpdatesFeed';
import { useProducts } from '@/hooks/useProducts';

type ViewMode = 'grid' | 'list';

const ProductsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { products, isLoading } = useProducts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'hidden': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your digital products, events, and collaborations
            </p>
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-white via-blue-50/60 to-indigo-50/60 backdrop-blur-sm border border-slate-200/60">
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:via-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:shadow-sm"
            >
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="updates" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-white data-[state=active]:via-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:shadow-sm"
            >
              Recent Updates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            {/* View Controls */}
            <Card className="bg-gradient-to-r from-white via-slate-50/60 to-blue-50/40 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">View:</span>
                    <div className="flex bg-gradient-to-r from-slate-100 to-blue-100 rounded-lg p-1">
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-slate-600">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm border-slate-200/60">
                <CardContent className="p-8 text-center">
                  <div className="text-slate-600 mb-2">No products found</div>
                  <p className="text-sm text-slate-500">Create your first product to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      title: product.title,
                      product_type: product.product_type,
                      description: product.description,
                      price: product.price,
                      is_free: product.is_free,
                      status: product.status,
                      thumbnail_url: product.thumbnail_url,
                      created_at: product.created_at,
                      views_count: product.views_count
                    }}
                    viewMode={viewMode}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onViewStats={handleViewStats}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
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
