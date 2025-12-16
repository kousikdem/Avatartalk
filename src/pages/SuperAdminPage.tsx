import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, Settings, Users, Activity, Coins, Brain, 
  RefreshCw, Plus, AlertTriangle, CheckCircle, BarChart3 
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import SuperAdminAnalytics from '@/components/SuperAdminAnalytics';

const SuperAdminPage = () => {
  const {
    isSuperAdmin,
    loading,
    platformSettings,
    featureFlags,
    auditLogs,
    tokenConfigs,
    aiLimits,
    users,
    toggleFeatureFlag,
    updatePlatformSetting,
    updateTokenConfig,
    updateAILimit,
    assignRole,
    addTokensToUser,
    refetch
  } = useSuperAdmin();

  const [tokenAmount, setTokenAmount] = useState<number>(1000);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have super admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform settings, users, and configurations</p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full max-w-4xl">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Limits
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <SuperAdminAnalytics />
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable platform features globally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureFlags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{flag.flag_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                        {flag.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                    <div className="flex gap-1">
                      {flag.affected_roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                      ))}
                    </div>
                  </div>
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={(checked) => toggleFeatureFlag(flag.id, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Settings Tab */}
        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {platformSettings.map((setting) => (
                <div key={setting.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <Badge variant="outline">
                      {format(new Date(setting.updated_at), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                  <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(setting.setting_value, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Configuration Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Configuration</CardTitle>
              <CardDescription>Manage token packages and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tokenConfigs.map((config) => (
                <div key={config.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{config.config_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(config.config_value, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Limits Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI System Limits</CardTitle>
              <CardDescription>Configure AI usage limits and rate limiting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiLimits.map((limit) => (
                <div key={limit.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{limit.limit_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <Badge variant="secondary">
                      {JSON.stringify(limit.limit_value.limit || limit.limit_value)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{limit.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and token balances</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch.users()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => assignRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
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
                        {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUserId(user.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tokens
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Tokens to {user.email}</DialogTitle>
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Track all administrative actions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch.auditLogs()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No audit logs yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.created_at), 'MMM d, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action_type}</Badge>
                        </TableCell>
                        <TableCell>{log.target_table || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.new_value ? JSON.stringify(log.new_value) : '-'}
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
    </div>
  );
};

export default SuperAdminPage;
