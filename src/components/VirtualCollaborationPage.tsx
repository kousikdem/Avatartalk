import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Video, Calendar as CalendarIcon, Users, DollarSign, 
  TrendingUp, Clock, MapPin, Eye, Edit, Trash2, ExternalLink,
  Percent, RefreshCw, Search, Settings, Link2, CheckCircle2,
  AlertCircle, Play, Pause, Copy, Mail, Phone, Building2,
  Ticket, Star, Filter, Grid3X3, List, Zap, Globe, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useVirtualCollaborations, VirtualProduct, VirtualBooking } from '@/hooks/useVirtualCollaborations';
import VirtualProductForm from './VirtualProductForm';
import VirtualBookingCard from './VirtualBookingCard';
import TokenDisplay from './TokenDisplay';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { LimitReachedBanner } from '@/components/LockedFeatureOverlay';
import PlanBadge from '@/components/PlanBadge';
import { GenericPageSkeleton } from '@/components/ui/page-skeletons';
import { useAuth } from '@/context/auth';

type ViewMode = 'grid' | 'list';
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

const EXCHANGE_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095
};

const VirtualCollaborationPage = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VirtualProduct | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const { toast } = useToast();
  
  // Plan features
  const { 
    canHostVirtualMeetings, 
    canAddCollaboration, 
    limits, 
    effectivePlanKey,
    hasFeature
  } = usePlanFeatures();
  
  const { 
    products, 
    bookings, 
    integrations,
    isLoading, 
    fetchProducts,
    fetchIntegrations,
    createProduct,
    updateProduct,
    deleteProduct,
    connectGoogle,
    connectZoom,
    createZoomMeeting,
    disconnectZoom,
    disconnectIntegration
  } = useVirtualCollaborations();

  const { user } = useAuth();
  const currentUserId = user?.id || null;

  // Calculate statistics
  const myProducts = products.filter(p => p.user_id === currentUserId);
  const myBookings = bookings.filter(b => b.seller_id === currentUserId);
  const receivedBookings = bookings.filter(b => b.buyer_id === currentUserId);
  
  const totalEarnings = myBookings.filter(b => b.payment_status === 'captured').reduce((sum, b) => sum + b.amount, 0);
  const platformFees = myBookings.filter(b => b.payment_status === 'captured').reduce((sum, b) => sum + (b.platform_fee || 0), 0);
  const netEarnings = totalEarnings - platformFees;
  const totalBookings = myBookings.length;
  const upcomingBookings = myBookings.filter(b => new Date(b.scheduled_at) > new Date()).length;
  const completedBookings = myBookings.filter(b => b.status === 'completed').length;

  // Filter products
  const filteredProducts = myProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || product.product_type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number, currency: Currency) => {
    const converted = amount * EXCHANGE_RATES[currency];
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(converted / 100);
  };

  const handleConnectGoogle = async () => {
    toast({
      title: "Coming Soon",
      description: "Google Meet & Calendar integration will be available soon.",
    });
  };

  const handleConnectZoom = async () => {
    if (integrations?.zoom_connected) {
      // Disconnect
      await disconnectZoom();
      return;
    }

    const authUrl = await connectZoom();
    if (authUrl) {
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'zoom_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'zoom_oauth_success') {
          toast({
            title: "Zoom Connected",
            description: `Connected as ${event.data.email}`,
          });
          fetchIntegrations();
          window.removeEventListener('message', handleMessage);
        } else if (event.data?.type === 'zoom_oauth_error') {
          toast({
            title: "Connection Failed",
            description: "Failed to connect Zoom. Please try again.",
            variant: "destructive"
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
      }, 300000);
    }
  };

  const handleEditProduct = (product: VirtualProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Product deleted",
        description: "Virtual collaboration product has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'one_to_one': return <Users className="w-4 h-4" />;
      case 'webinar': return <Video className="w-4 h-4" />;
      case 'brand_collaboration': return <Zap className="w-4 h-4" />;
      case 'recurring': return <RefreshCw className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'one_to_one': return 'One-to-One';
      case 'webinar': return 'Webinar/Event';
      case 'brand_collaboration': return 'Brand Collaboration';
      case 'recurring': return 'Recurring Series';
      default: return type;
    }
  };

  // Promo settings state
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // Lazy import PromoForm to avoid circular deps
  const [PromoFormComponent, setPromoFormComponent] = useState<any>(null);
  useEffect(() => {
    import('./PromoForm').then(module => {
      setPromoFormComponent(() => module.PromoForm);
    });
  }, []);

  // Show skeleton instantly while loading
  if (isLoading && products.length === 0) {
    return <GenericPageSkeleton title stats={4} tabs={3} cards={6} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Virtual Collaboration
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage virtual meetings, events, and brand collaborations
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap items-center">
            <TokenDisplay compact />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchProducts()}
              className="h-10 w-10"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
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
            
            {/* Create Collaboration - Available in all plans with limits */}
            <Button 
              onClick={() => {
                if (!canAddCollaboration(myProducts.length)) {
                  toast({
                    title: "Collaboration Limit Reached",
                    description: `Upgrade to add more collaborations. Current limit: ${limits.collaborations === -1 ? 'unlimited' : limits.collaborations}`,
                    variant: "destructive",
                  });
                  navigate('/pricing');
                  return;
                }
                setIsAddModalOpen(true);
              }}
              className="bg-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Virtual Collaboration
              {limits.collaborations !== -1 && (
                <Badge variant="secondary" className="ml-2 text-xs bg-white/20">
                  {myProducts.length}/{limits.collaborations}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Promo Settings Card - Locked for Free plan */}
        <Card className={`border-2 bg-gradient-to-r from-orange-50/50 via-yellow-50/50 to-amber-50/50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-amber-950/20 ${!hasFeature('promo_codes_enabled') ? 'opacity-70' : ''}`}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${hasFeature('promo_codes_enabled') ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-muted'}`}>
                  {hasFeature('promo_codes_enabled') ? (
                    <Percent className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Promo Codes</h3>
                    {!hasFeature('promo_codes_enabled') && (
                      <Badge variant="secondary" className="text-xs">Creator+</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasFeature('promo_codes_enabled') 
                      ? 'Create discount codes for your virtual collaborations' 
                      : 'Upgrade to Creator plan to create promo codes'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {hasFeature('promo_codes_enabled') ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/dashboard/promos')}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Manage All Promos
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingPromo(null);
                        setShowPromoModal(true);
                      }}
                      className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                      <Plus className="w-4 h-4" />
                      Create Promo
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => navigate('/pricing')}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Creator
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limit Reached Banner */}
        <LimitReachedBanner
          currentCount={myProducts.length}
          limit={limits.collaborations === -1 ? 'unlimited' : limits.collaborations}
          itemName="Collaborations"
          planForMore={effectivePlanKey === 'pro' ? 'business' : 'pro'}
        />

        {/* Promo Modal */}
        {PromoFormComponent && (
          <PromoFormComponent
            open={showPromoModal}
            onClose={() => {
              setShowPromoModal(false);
              setEditingPromo(null);
            }}
            promo={editingPromo}
          />
        )}

        {/* Integration Bar */}
        <Card className="border-2 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Integrations</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Google Connect - Coming Soon */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2 opacity-60 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google Meet</span>
                  </Button>
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-1.5">
                    Coming Soon
                  </Badge>
                </div>

                {/* Zoom Connect */}
                <Button
                  variant={integrations?.zoom_connected ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleConnectZoom}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#2D8CFF">
                    <path d="M4.5 4.5h10.8c1.32 0 2.4 1.08 2.4 2.4v6c0 1.32-1.08 2.4-2.4 2.4H4.5c-1.32 0-2.4-1.08-2.4-2.4v-6c0-1.32 1.08-2.4 2.4-2.4zm13.2 3l3.9-2.4v7.8l-3.9-2.4V7.5z"/>
                  </svg>
                  {integrations?.zoom_connected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>Zoom: {integrations.zoom_email || 'Connected'}</span>
                    </>
                  ) : (
                    <span>Connect Zoom</span>
                  )}
                </Button>

                {/* Calendar Sync Toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md border">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="calendar-sync" className="text-sm cursor-pointer">Calendar Sync</Label>
                  <Switch
                    id="calendar-sync"
                    checked={calendarSyncEnabled}
                    onCheckedChange={setCalendarSyncEnabled}
                    disabled={!integrations?.google_connected}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">{myProducts.length}</p>
                </div>
                <Video className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{totalBookings}</p>
                </div>
                <Ticket className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingBookings}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalEarnings, selectedCurrency)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Platform Fee (10%)</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(platformFees, selectedCurrency)}</p>
                </div>
                <Percent className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Net Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(netEarnings, selectedCurrency)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Products & Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">My Products ({myProducts.length})</TabsTrigger>
                <TabsTrigger value="bookings">Bookings Received</TabsTrigger>
                <TabsTrigger value="purchased">My Purchases</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-4 mt-4">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="one_to_one">One-to-One</SelectItem>
                      <SelectItem value="webinar">Webinar/Event</SelectItem>
                      <SelectItem value="brand_collaboration">Brand Collab</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
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

                {/* Products Grid/List */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Virtual Collaborations Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first virtual meeting, webinar, or brand collaboration
                      </p>
                      <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Product
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="border-2 hover:shadow-lg transition-all overflow-hidden">
                        {/* Thumbnail */}
                        {product.thumbnail_url && (
                          <div className="h-32 overflow-hidden">
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              {getProductTypeIcon(product.product_type)}
                              <Badge variant="secondary">{getProductTypeLabel(product.product_type)}</Badge>
                            </div>
                            <Badge variant={product.status === 'published' ? 'default' : 'outline'}>
                              {product.status}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{product.description}</p>
                          
                          {/* Event Date */}
                          {product.event_date && (
                            <div className="flex items-center gap-2 text-sm text-primary mb-3">
                              <CalendarIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {new Date(product.event_date).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {product.duration_mins} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {product.capacity || 1} spots
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(product.price, selectedCurrency)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {product.provider === 'google_meet' && (
                              <Badge variant="outline" className="text-xs">Google Meet</Badge>
                            )}
                            {product.provider === 'zoom' && (
                              <Badge variant="outline" className="text-xs">Zoom</Badge>
                            )}
                            {product.provider === 'manual' && (
                              <Badge variant="outline" className="text-xs">Manual Link</Badge>
                            )}
                            {product.auto_generate_link && product.provider !== 'manual' && (
                              <Badge variant="outline" className="text-xs text-green-600">Auto-link</Badge>
                            )}
                            {product.join_url && (
                              <Badge variant="outline" className="text-xs text-blue-600">
                                <Link2 className="w-3 h-3 mr-1" />
                                Link Set
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(product)}>
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4 mt-4">
                {myBookings.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                      <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                      <p className="text-muted-foreground">
                        Bookings will appear here when visitors book your virtual collaborations
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <VirtualBookingCard key={booking.id} booking={booking} type="received" />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="purchased" className="space-y-4 mt-4">
                {receivedBookings.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                      <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Purchases Yet</h3>
                      <p className="text-muted-foreground">
                        Virtual collaborations you purchase will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {receivedBookings.map((booking) => (
                      <VirtualBookingCard key={booking.id} booking={booking} type="purchased" />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Calendar & Quick Stats */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Schedule Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Today's Bookings</span>
                  <Badge>{myBookings.filter(b => {
                    const bookingDate = new Date(b.scheduled_at).toDateString();
                    return bookingDate === new Date().toDateString();
                  }).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <Badge variant="secondary">{myBookings.filter(b => {
                    const bookingDate = new Date(b.scheduled_at);
                    const today = new Date();
                    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return bookingDate >= today && bookingDate <= weekFromNow;
                  }).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="outline">{completedBookings}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Codes Quick Access */}
            <Card className={`border-2 ${!hasFeature('promo_codes_enabled') ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Promo Codes
                  {!hasFeature('promo_codes_enabled') && (
                    <PlanBadge className="ml-1" showIcon={false} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {hasFeature('promo_codes_enabled')
                    ? 'Apply promo codes to virtual collaborations'
                    : 'Upgrade to Creator plan to use promo codes'}
                </p>
                <Button
                  variant="outline"
                  className={`w-full ${!hasFeature('promo_codes_enabled') ? 'opacity-60' : ''}`}
                  onClick={() => {
                    if (!hasFeature('promo_codes_enabled')) {
                      navigate('/pricing');
                      return;
                    }
                    navigate('/settings/promo');
                  }}
                >
                  {!hasFeature('promo_codes_enabled') ? (
                    <Lock className="w-4 h-4 mr-2" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  Manage Promos
                  {!hasFeature('promo_codes_enabled') && (
                    <Badge variant="secondary" className="ml-2 text-xs">Creator+</Badge>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Virtual Collaboration</DialogTitle>
              <DialogDescription>
                Set up a new virtual meeting, webinar, or brand collaboration
              </DialogDescription>
            </DialogHeader>
            <VirtualProductForm 
              onClose={() => setIsAddModalOpen(false)} 
              onSave={(data) => {
                createProduct(data);
                setIsAddModalOpen(false);
              }}
              integrations={integrations}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Virtual Collaboration</DialogTitle>
              <DialogDescription>
                Update your virtual collaboration settings
              </DialogDescription>
            </DialogHeader>
            <VirtualProductForm 
              product={selectedProduct}
              onClose={() => setIsEditModalOpen(false)} 
              onSave={(data) => {
                if (selectedProduct) {
                  updateProduct(selectedProduct.id, data);
                }
                setIsEditModalOpen(false);
              }}
              integrations={integrations}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VirtualCollaborationPage;
