import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, Search, Edit, Trash2, Power, Copy, BarChart3,
  TrendingUp, Users, ShoppingCart, Percent, AlertCircle,
  Sparkles, Calendar, Target, Lock, Zap
} from 'lucide-react';
import { usePromos, PromoCode } from '@/hooks/usePromos';
import { PromoForm } from './PromoForm';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

export const PromoSettingsPage = () => {
  const navigate = useNavigate();
  const { promos, isLoading, deletePromo, togglePromoStatus } = usePromos();
  const { toast } = useToast();
  const { hasFeature } = usePlanFeatures();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Check if user has promo code feature
  const canUsePromos = hasFeature('promo_codes_enabled');

  // Show upgrade prompt if feature is locked
  if (!canUsePromos) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Promo Codes - Creator Plan Feature</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create discount codes and promotions for your products and virtual collaborations. 
                  Upgrade to Creator plan or higher to unlock this feature.
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Zap className="w-5 h-5 mr-2" />
                Upgrade to Creator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredPromos = promos.filter(promo =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePromos = filteredPromos.filter(p => p.active);
  const inactivePromos = filteredPromos.filter(p => !p.active);

  const totalRedemptions = promos.reduce((sum, p) => sum + p.analytics_data.redemptions, 0);
  const totalRevenueLost = promos.reduce((sum, p) => sum + p.analytics_data.revenue_lost, 0);
  const totalRevenueGenerated = promos.reduce((sum, p) => sum + p.analytics_data.revenue_generated, 0);

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setIsFormOpen(true);
  };

  const handleDelete = async (promoId: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      await deletePromo(promoId);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Promo code ${code} copied to clipboard`,
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPromo(null);
  };

  const PromoCard = ({ promo }: { promo: PromoCode }) => {
    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
    const usagePercent = promo.max_uses ? (promo.current_uses / promo.max_uses) * 100 : 0;

    return (
      <Card className={`border-2 ${!promo.active || isExpired ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-mono">{promo.code}</h3>
                {promo.auto_apply && <Badge className="bg-green-500">AUTO</Badge>}
                {promo.flash_sale && <Badge variant="destructive">FLASH</Badge>}
                {isExpired && <Badge variant="secondary">EXPIRED</Badge>}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">
                  {promo.discount_type === 'percent' && `${promo.discount_value}% OFF`}
                  {promo.discount_type === 'fixed' && `₹${promo.discount_value} OFF`}
                  {promo.discount_type === 'free_shipping' && 'FREE SHIPPING'}
                </Badge>
                <span className="text-muted-foreground">Priority: {promo.priority}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyCode(promo.code)}
                title="Copy Code"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePromoStatus(promo.id, !promo.active)}
                title={promo.active ? 'Deactivate' : 'Activate'}
              >
                <Power className={`w-4 h-4 ${promo.active ? 'text-green-500' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(promo)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(promo.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Uses</p>
              <p className="text-lg font-semibold">
                {promo.current_uses}
                {promo.max_uses && ` / ${promo.max_uses}`}
              </p>
              {promo.max_uses && (
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue Generated</p>
              <p className="text-lg font-semibold text-green-600">
                ₹{(promo.analytics_data.revenue_generated / 100).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Discount Given</p>
              <p className="text-lg font-semibold text-orange-600">
                ₹{(promo.analytics_data.revenue_lost / 100).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Targeting Info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {promo.target_buyer_type !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {promo.target_buyer_type}
              </Badge>
            )}
            {promo.target_product_type !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {promo.target_product_type}
              </Badge>
            )}
            {promo.min_order_value && (
              <Badge variant="secondary" className="text-xs">
                Min: ₹{promo.min_order_value / 100}
              </Badge>
            )}
            {promo.free_shipping && (
              <Badge variant="secondary" className="text-xs">
                Free Shipping
              </Badge>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {promo.starts_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Starts: {formatDistanceToNow(new Date(promo.starts_at), { addSuffix: true })}
              </span>
            )}
            {promo.expires_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Expires: {formatDistanceToNow(new Date(promo.expires_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Percent className="w-8 h-8 text-primary" />
              Promo & Discount Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage promo codes for your products
            </p>
          </div>
          
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Promo
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Active Promos</p>
                  <p className="text-2xl font-bold text-foreground">{activePromos.length}</p>
                </div>
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Redemptions</p>
                  <p className="text-2xl font-bold text-foreground">{totalRedemptions}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Revenue Generated</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{(totalRevenueGenerated / 100).toFixed(0)}
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
                  <p className="text-sm text-muted-foreground font-medium">Discount Given</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{(totalRevenueLost / 100).toFixed(0)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search promo codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Promo Lists */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activePromos.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactivePromos.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({filteredPromos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activePromos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active promo codes</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first promo code to start offering discounts
                  </p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Promo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activePromos.map(promo => (
                  <PromoCard key={promo.id} promo={promo} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4 mt-6">
            {inactivePromos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No inactive promo codes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inactivePromos.map(promo => (
                  <PromoCard key={promo.id} promo={promo} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredPromos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No promo codes found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPromos.map(promo => (
                  <PromoCard key={promo.id} promo={promo} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Promo Form Dialog */}
        <PromoForm
          open={isFormOpen}
          onClose={handleCloseForm}
          promo={editingPromo}
        />
      </div>
    </div>
  );
};