import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, Plus, Edit, Trash2, Crown, Users, Search, 
  DollarSign, Coins, Settings, ChevronUp, Save, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePlatformPlanManagement, PlatformPricingPlan } from '@/hooks/usePlatformPricingPlans';

interface UserWithSubscription {
  id: string;
  email: string;
  username: string;
  full_name: string;
  plan_key: string;
  expires_at: string | null;
}

const BILLING_DURATIONS = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
  { value: 12, label: '12 Months' },
  { value: 24, label: '24 Months' },
];

const PlanManagement = () => {
  const { toast } = useToast();
  const { updatePlan, getAllPlans } = usePlatformPlanManagement();
  
  const [plans, setPlans] = useState<PlatformPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlatformPricingPlan | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // User upgrade states
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithSubscription[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({ title: "Error", description: "Failed to load plans", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSearchUsers = async () => {
    if (!userSearch.trim()) return;

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .or(`username.ilike.%${userSearch}%,full_name.ilike.%${userSearch}%`)
        .limit(10);

      if (error) throw error;

      // Get subscription info for each user
      const usersWithSubs: UserWithSubscription[] = [];
      for (const profile of profiles || []) {
        const { data: sub } = await supabase
          .from('user_platform_subscriptions')
          .select('plan_key, expires_at')
          .eq('user_id', profile.id)
          .maybeSingle();

        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);

        usersWithSubs.push({
          id: profile.id,
          email: (authUser?.user as any)?.email || 'N/A',
          username: profile.username || '',
          full_name: profile.full_name || '',
          plan_key: sub?.plan_key || 'free',
          expires_at: sub?.expires_at || null,
        });
      }

      setSearchResults(usersWithSubs);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({ title: "Error", description: "Failed to search users", variant: "destructive" });
    }
  };

  const handleUpgradeUser = async () => {
    if (!selectedUser || !selectedNewPlan) return;

    const plan = plans.find(p => p.plan_key === selectedNewPlan);
    if (!plan) return;

    setUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-platform-plan-change', {
        body: {
          targetUserId: selectedUser.id,
          planId: plan.id,
          billingCycleMonths: selectedDuration,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User upgraded to ${selectedNewPlan} for ${selectedDuration} month(s). Tokens updated${data?.tokenDelta ? ` (+${data.tokenDelta})` : ''}.`,
      });

      setSelectedUser(null);
      setSelectedNewPlan('');
      setSelectedDuration(1);
      setShowUpgradeDialog(false);
      handleSearchUsers(); // Refresh search results
    } catch (error) {
      console.error('Error upgrading user:', error);
      toast({ title: 'Error', description: 'Failed to change user plan', variant: 'destructive' });
    } finally {
      setUpgrading(false);
    }
  };

  const getCalculatedPrice = (plan: PlatformPricingPlan, months: number) => {
    switch (months) {
      case 3:
        return { inr: plan.price_3_month_inr, usd: plan.price_3_month_usd };
      case 6:
        return { inr: plan.price_6_month_inr, usd: plan.price_6_month_usd };
      case 12:
        return { inr: plan.price_12_month_inr, usd: plan.price_12_month_usd };
      case 24:
        // For 24 months, calculate as 2x 12-month price with potential discount
        const yearPrice = plan.price_12_month_inr || plan.price_inr * 12;
        const yearPriceUsd = plan.price_12_month_usd || plan.price_usd * 12;
        return { inr: yearPrice * 2, usd: yearPriceUsd * 2 };
      default:
        return { inr: plan.price_inr, usd: plan.price_usd };
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    const success = await updatePlan(editingPlan.id, {
      plan_name: editingPlan.plan_name,
      tagline: editingPlan.tagline,
      price_inr: editingPlan.price_inr,
      price_usd: editingPlan.price_usd,
      price_3_month_inr: editingPlan.price_3_month_inr,
      price_6_month_inr: editingPlan.price_6_month_inr,
      price_12_month_inr: editingPlan.price_12_month_inr,
      price_3_month_usd: editingPlan.price_3_month_usd,
      price_6_month_usd: editingPlan.price_6_month_usd,
      price_12_month_usd: editingPlan.price_12_month_usd,
      discount_3_month: editingPlan.discount_3_month,
      discount_6_month: editingPlan.discount_6_month,
      discount_12_month: editingPlan.discount_12_month,
      ai_tokens_monthly: editingPlan.ai_tokens_monthly,
      is_popular: editingPlan.is_popular,
      is_active: editingPlan.is_active,
      offer_text: editingPlan.offer_text,
      offer_badge: editingPlan.offer_badge,
    });

    if (success) {
      setShowEditDialog(false);
      setEditingPlan(null);
      fetchPlans();
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${tokens / 1000000}M`;
    if (tokens >= 1000) return `${tokens / 1000}K`;
    return tokens.toString();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Manage Plans
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4" />
            Upgrade Users
          </TabsTrigger>
        </TabsList>

        {/* Plans Management Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Platform Pricing Plans</CardTitle>
                <CardDescription>Manage subscription plans, pricing, and features</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchPlans}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Price (INR)</TableHead>
                      <TableHead>Price (USD)</TableHead>
                      <TableHead>AI Tokens</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{plan.plan_name}</span>
                            {plan.is_popular && (
                              <Badge className="bg-primary">Popular</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>₹{plan.price_inr}/mo</div>
                            <div className="text-xs text-muted-foreground">
                              3mo: ₹{plan.price_3_month_inr} | 6mo: ₹{plan.price_6_month_inr} | 1yr: ₹{plan.price_12_month_inr}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>${plan.price_usd}/mo</div>
                            <div className="text-xs text-muted-foreground">
                              3mo: ${plan.price_3_month_usd} | 6mo: ${plan.price_6_month_usd} | 1yr: ${plan.price_12_month_usd}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatTokens(plan.ai_tokens_monthly)}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPlan(plan);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Users Tab */}
        <TabsContent value="upgrade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade User Plan</CardTitle>
              <CardDescription>Search for a user and upgrade their plan manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by username or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                />
                <Button onClick={handleSearchUsers}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Current Plan</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name || user.username}</div>
                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.plan_key}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.expires_at 
                            ? new Date(user.expires_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUpgradeDialog(true);
                            }}
                          >
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Upgrade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan: {editingPlan?.plan_name}</DialogTitle>
            <DialogDescription>
              Modify plan settings, pricing, and features
            </DialogDescription>
          </DialogHeader>
          
          {editingPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={editingPlan.plan_name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, plan_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={editingPlan.tagline || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monthly Pricing</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">INR</Label>
                    <Input
                      type="number"
                      value={editingPlan.price_inr}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price_inr: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">USD</Label>
                    <Input
                      type="number"
                      value={editingPlan.price_usd}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price_usd: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Multi-Month Pricing (INR)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">3 Months</Label>
                    <Input
                      type="number"
                      value={editingPlan.price_3_month_inr || 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price_3_month_inr: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">6 Months</Label>
                    <Input
                      type="number"
                      value={editingPlan.price_6_month_inr || 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price_6_month_inr: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">12 Months</Label>
                    <Input
                      type="number"
                      value={editingPlan.price_12_month_inr || 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price_12_month_inr: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discounts (%)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">3 Months</Label>
                    <Input
                      type="number"
                      value={editingPlan.discount_3_month || 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, discount_3_month: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">6 Months</Label>
                    <Input
                      type="number"
                      value={editingPlan.discount_6_month || 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, discount_6_month: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">12 Months</Label>
                    <Input
                      type="number"
                      value={editingPlan.discount_12_month || 0}
                      onChange={(e) => setEditingPlan({ ...editingPlan, discount_12_month: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>AI Tokens (Monthly)</Label>
                <Input
                  type="number"
                  value={editingPlan.ai_tokens_monthly}
                  onChange={(e) => setEditingPlan({ ...editingPlan, ai_tokens_monthly: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Offer Badge</Label>
                  <Input
                    placeholder="e.g., 20% OFF"
                    value={editingPlan.offer_badge || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, offer_badge: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Offer Text</Label>
                  <Input
                    placeholder="e.g., Limited time offer"
                    value={editingPlan.offer_text || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, offer_text: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPlan.is_popular}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_popular: checked })}
                  />
                  <Label>Mark as Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPlan.is_active}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSavePlan}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade User Popup Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={(open) => {
        setShowUpgradeDialog(open);
        if (!open) {
          setSelectedUser(null);
          setSelectedNewPlan('');
          setSelectedDuration(1);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChevronUp className="w-5 h-5 text-primary" />
              Upgrade User Plan
            </DialogTitle>
            <DialogDescription>
              Select a plan and billing duration for {selectedUser?.full_name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{selectedUser.full_name || selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <Badge variant="secondary" className="capitalize">
                    {selectedUser.plan_key}
                  </Badge>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Select New Plan</Label>
                <Select value={selectedNewPlan} onValueChange={setSelectedNewPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.filter(p => p.is_active).map((plan) => (
                      <SelectItem key={plan.id} value={plan.plan_key}>
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-primary" />
                          <span>{plan.plan_name}</span>
                          <span className="text-muted-foreground">- ₹{plan.price_inr}/mo</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <Label>Billing Duration</Label>
                <div className="grid grid-cols-5 gap-2">
                  {BILLING_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      type="button"
                      variant={selectedDuration === duration.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDuration(duration.value)}
                      className="text-xs"
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Preview */}
              {selectedNewPlan && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Price</span>
                    <div className="text-right">
                      {(() => {
                        const plan = plans.find(p => p.plan_key === selectedNewPlan);
                        if (!plan) return null;
                        const price = getCalculatedPrice(plan, selectedDuration);
                        return (
                          <>
                            <p className="font-bold text-lg">₹{price.inr?.toLocaleString() || (plan.price_inr * selectedDuration).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">≈ ${price.usd?.toLocaleString() || (plan.price_usd * selectedDuration).toLocaleString()}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    For {selectedDuration} month{selectedDuration > 1 ? 's' : ''} subscription
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={handleUpgradeUser}
                  disabled={!selectedNewPlan || upgrading}
                >
                  {upgrading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ChevronUp className="w-4 h-4 mr-2" />
                  )}
                  Confirm Upgrade
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUpgradeDialog(false);
                    setSelectedUser(null);
                    setSelectedNewPlan('');
                    setSelectedDuration(1);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanManagement;
