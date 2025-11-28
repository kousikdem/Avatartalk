import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Grid3X3, List, Eye, Edit, Trash2, TrendingUp, 
  ShoppingBag, DollarSign, Package, Download, Store
} from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import ProductUpdatesFeed from '@/components/ProductUpdatesFeed';
import { useProducts } from '@/hooks/useProducts';

type ViewMode = 'grid' | 'list';

const ProductsPageEnhanced = () => {
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

  const digitalProducts = products.filter(p => p.product_type === 'digital');
  const physicalProducts = products.filter(p => p.product_type === 'physical');
  const totalRevenue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.views_count || 0)), 0);

  const handleEditProduct = (productId: string) => {
    console.log('Edit product:', productId);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
  };

  const handleViewStats = (productId: string) => {
    console.log('View stats for product:', productId);
  };

  const handleShopifyConnect = () => {
    console.log('Connect Shopify');
    // TODO: Implement Shopify OAuth flow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your digital & physical products, sync with Shopify
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleShopifyConnect}
              className="border-2 border-green-500/50 hover:bg-green-500/10"
            >
              <Store className="w-4 h-4 mr-2" />
              Connect Shopify
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{products.length}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Physical</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{physicalProducts.length}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Digital</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{digitalProducts.length}</p>
                </div>
                <Download className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Est. Revenue</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    ₹{(totalRevenue / 100).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopify Integration Notice */}
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <Store className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Connect your Shopify store to sync products and manage inventory seamlessly. Both Razorpay and Shopify payments supported.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            {/* View Controls */}
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">View:</span>
                    <div className="flex bg-muted rounded-lg p-1">
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

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{products.length}</span>
                    <span>products total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground mb-2">No products found</div>
                  <p className="text-sm text-muted-foreground">Create your first product to get started</p>
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

export default ProductsPageEnhanced;