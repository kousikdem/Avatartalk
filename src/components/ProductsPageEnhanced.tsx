import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Grid3X3, List, Eye, Edit, Trash2, TrendingUp, 
  ShoppingBag, DollarSign, Package, Download, Store, Search,
  Filter, BarChart3, CreditCard, TrendingDown, Percent
} from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import { OrdersDashboard } from '@/components/OrdersDashboard';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'list';
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

const EXCHANGE_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095
};

const ProductsPageEnhanced = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { products, isLoading } = useProducts();
  const { orders } = useOrders();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hidden': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate statistics
  const myProducts = products.filter(p => p.user_id === currentUserId);
  const digitalProducts = myProducts.filter(p => p.product_type === 'digital');
  const physicalProducts = myProducts.filter(p => p.product_type === 'physical');
  
  const sellerOrders = orders.filter(o => o.seller_id === currentUserId && o.payment_status === 'captured');
  const totalEarnings = sellerOrders.reduce((sum, o) => sum + o.amount, 0);
  const platformFees = sellerOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);
  const netEarnings = totalEarnings - platformFees;
  
  const physicalSales = sellerOrders.filter(o => {
    const product = products.find(p => p.id === o.product_id);
    return product?.product_type === 'physical';
  });
  const digitalSales = sellerOrders.filter(o => {
    const product = products.find(p => p.id === o.product_id);
    return product?.product_type === 'digital';
  });

  const physicalSalesCount = physicalSales.length;
  const physicalSalesRevenue = physicalSales.reduce((sum, o) => sum + o.amount, 0);
  const digitalSalesCount = digitalSales.length;
  const digitalSalesRevenue = digitalSales.reduce((sum, o) => sum + o.amount, 0);

  // Filter products
  const filteredProducts = myProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesType = filterType === 'all' || product.product_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleEditProduct = (productId: string) => {
    toast({
      title: "Edit Product",
      description: "Edit functionality coming soon",
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleViewStats = (productId: string) => {
    toast({
      title: "Product Analytics",
      description: "Analytics view coming soon",
    });
  };

  const handleShopifyConnect = () => {
    toast({
      title: "Coming Soon",
      description: "Shopify integration will be available soon. Request early access!",
    });
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    const converted = amount * EXCHANGE_RATES[currency];
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(converted / 100);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Product Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your digital & physical products, sync with Shopify
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as Currency)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={handleShopifyConnect}
              className="border-2"
            >
              <Store className="w-4 h-4 mr-2" />
              Shopify
              <Badge variant="secondary" className="ml-2">Soon</Badge>
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalEarnings, selectedCurrency)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Net Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(netEarnings, selectedCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Platform Fee: {formatCurrency(platformFees, selectedCurrency)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Physical Sales</p>
                  <p className="text-2xl font-bold text-foreground">{physicalSalesCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(physicalSalesRevenue, selectedCurrency)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Digital Sales</p>
                  <p className="text-2xl font-bold text-foreground">{digitalSalesCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(digitalSalesRevenue, selectedCurrency)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopify Integration Notice */}
        <Alert className="border-2">
          <Store className="w-4 h-4" />
          <AlertDescription>
            <strong>Shopify Integration Coming Soon!</strong> Connect your store to sync products and manage inventory. 
            Accept payments via Razorpay for all products.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="sales">Sales Orders</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            {/* Filters & Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                    </SelectContent>
                  </Select>

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
              </CardContent>
            </Card>

            {/* Products Display */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading products...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== 'all' || filterType !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Create your first product to get started'
                    }
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
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
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <OrdersDashboard type="seller" />
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <OrdersDashboard type="buyer" />
          </TabsContent>
        </Tabs>

        {/* Add Product Modal */}
        <ProductForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => setIsAddModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProductsPageEnhanced;
