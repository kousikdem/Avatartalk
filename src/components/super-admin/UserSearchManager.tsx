import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Filter, Users, RefreshCw, Plus, Mail, Calendar, 
  Coins, ShoppingBag, Video, UserCheck, UserX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UserWithDetails {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  profile_pic_url: string | null;
  token_balance: number | null;
  followers_count: number | null;
  following_count: number | null;
  created_at: string | null;
  role: string;
  products_count: number;
  orders_count: number;
  subscriptions_count: number;
}

export const UserSearchManager = () => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    hasProducts: 'all',
    hasSubscriptions: 'all',
    tokenRange: 'all',
    dateRange: 'all'
  });
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [tokenAmount, setTokenAmount] = useState(1000);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, username, display_name, avatar_url, profile_pic_url, token_balance, followers_count, following_count, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setLoading(false);
        return;
      }

      // Fetch roles
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

      // Fetch products count per user
      const { data: productsCounts } = await supabase
        .from('products')
        .select('user_id')
        .in('user_id', (profiles || []).map(p => p.id));
      
      const productsMap = new Map<string, number>();
      (productsCounts || []).forEach(p => {
        productsMap.set(p.user_id, (productsMap.get(p.user_id) || 0) + 1);
      });

      // Fetch orders count per user
      const { data: ordersCounts } = await supabase
        .from('orders')
        .select('buyer_id')
        .in('buyer_id', (profiles || []).map(p => p.id));
      
      const ordersMap = new Map<string, number>();
      (ordersCounts || []).forEach(o => {
        ordersMap.set(o.buyer_id, (ordersMap.get(o.buyer_id) || 0) + 1);
      });

      // Fetch subscriptions count per user
      const { data: subsCounts } = await supabase
        .from('subscriptions')
        .select('subscriber_id')
        .in('subscriber_id', (profiles || []).map(p => p.id));
      
      const subsMap = new Map<string, number>();
      (subsCounts || []).forEach(s => {
        subsMap.set(s.subscriber_id, (subsMap.get(s.subscriber_id) || 0) + 1);
      });

      const usersWithDetails: UserWithDetails[] = (profiles || []).map(p => ({
        ...p,
        role: roleMap.get(p.id) || 'user',
        products_count: productsMap.get(p.id) || 0,
        orders_count: ordersMap.get(p.id) || 0,
        subscriptions_count: subsMap.get(p.id) || 0
      }));

      // Apply filters
      let filteredUsers = usersWithDetails;

      if (filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.role === filters.role);
      }

      if (filters.hasProducts === 'yes') {
        filteredUsers = filteredUsers.filter(u => u.products_count > 0);
      } else if (filters.hasProducts === 'no') {
        filteredUsers = filteredUsers.filter(u => u.products_count === 0);
      }

      if (filters.hasSubscriptions === 'yes') {
        filteredUsers = filteredUsers.filter(u => u.subscriptions_count > 0);
      } else if (filters.hasSubscriptions === 'no') {
        filteredUsers = filteredUsers.filter(u => u.subscriptions_count === 0);
      }

      if (filters.tokenRange === 'low') {
        filteredUsers = filteredUsers.filter(u => (u.token_balance || 0) < 10000);
      } else if (filters.tokenRange === 'medium') {
        filteredUsers = filteredUsers.filter(u => (u.token_balance || 0) >= 10000 && (u.token_balance || 0) < 100000);
      } else if (filters.tokenRange === 'high') {
        filteredUsers = filteredUsers.filter(u => (u.token_balance || 0) >= 100000);
      }

      if (filters.dateRange === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredUsers = filteredUsers.filter(u => new Date(u.created_at || 0) >= today);
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredUsers = filteredUsers.filter(u => new Date(u.created_at || 0) >= weekAgo);
      } else if (filters.dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredUsers = filteredUsers.filter(u => new Date(u.created_at || 0) >= monthAgo);
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, filters]);

  const addTokensToUser = async (userId: string, amount: number) => {
    try {
      const { data, error } = await supabase.rpc('credit_user_tokens', {
        p_user_id: userId,
        p_tokens: amount,
        p_reason: 'bonus'
      });

      if (error) {
        console.error('RPC error:', error);
        toast({ title: 'Error', description: `Failed to add tokens: ${error.message}`, variant: 'destructive' });
        return;
      }

      const result = (data && typeof data === 'object')
        ? (data as { success?: boolean; error?: string })
        : null;

      if (result?.success === false) {
        toast({ title: 'Error', description: result.error || 'Failed to add tokens', variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: `Added ${amount.toLocaleString()} tokens` });
      fetchUsers();
    } catch (err) {
      console.error('Token add error:', err);
      toast({ title: 'Error', description: 'Failed to add tokens', variant: 'destructive' });
    }
  };

  const assignRole = async (userId: string, role: string) => {
    await supabase.from('user_roles').delete().eq('user_id', userId);
    
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: role as any });

    if (error) {
      toast({ title: 'Error', description: 'Failed to assign role', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: `Role assigned: ${role}` });
    fetchUsers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Search and manage platform users with advanced filters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, username, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Role</Label>
            <Select value={filters.role} onValueChange={(v) => setFilters(prev => ({ ...prev, role: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Has Products</Label>
            <Select value={filters.hasProducts} onValueChange={(v) => setFilters(prev => ({ ...prev, hasProducts: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Has Subscriptions</Label>
            <Select value={filters.hasSubscriptions} onValueChange={(v) => setFilters(prev => ({ ...prev, hasSubscriptions: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Token Balance</Label>
            <Select value={filters.tokenRange} onValueChange={(v) => setFilters(prev => ({ ...prev, tokenRange: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="low">&lt; 10K</SelectItem>
                <SelectItem value="medium">10K - 100K</SelectItem>
                <SelectItem value="high">&gt; 100K</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Joined</Label>
            <Select value={filters.dateRange} onValueChange={(v) => setFilters(prev => ({ ...prev, dateRange: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{users.length} users found</span>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Subs</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_pic_url || user.avatar_url || ''} />
                        <AvatarFallback>{(user.display_name || user.username || 'U')[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.display_name || user.username || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => assignRole(user.id, v)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{(user.token_balance || 0).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <ShoppingBag className="h-3 w-3" />
                      {user.products_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.orders_count}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Video className="h-3 w-3" />
                      {user.subscriptions_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Tokens
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Tokens to {user.display_name || user.email}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Token Amount</Label>
                            <Input
                              type="number"
                              value={tokenAmount}
                              onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)}
                              min={1}
                            />
                          </div>
                          <div className="flex gap-2">
                            {[1000, 10000, 50000, 100000].map(amount => (
                              <Button
                                key={amount}
                                variant="outline"
                                size="sm"
                                onClick={() => setTokenAmount(amount)}
                              >
                                {amount >= 1000 ? `${amount / 1000}K` : amount}
                              </Button>
                            ))}
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => addTokensToUser(user.id, tokenAmount)}
                          >
                            Add {tokenAmount.toLocaleString()} Tokens
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Loading users...' : 'No users found matching your filters'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
