import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useSuperAdminIntegrations } from '@/hooks/useSuperAdminIntegrations';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Shield, Settings, Users, Activity, Coins, Brain, 
  RefreshCw, Plus, AlertTriangle, CheckCircle, BarChart3,
  Key, CreditCard, Globe
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import SuperAdminAnalytics from '@/components/SuperAdminAnalytics';
import { IntegrationSecretsManager } from '@/components/super-admin/IntegrationSecretsManager';
import { IntegrationOAuthManager } from '@/components/super-admin/IntegrationOAuthManager';
import { RazorpayManagement } from '@/components/super-admin/RazorpayManagement';
import { SiteSettingsManager } from '@/components/super-admin/SiteSettingsManager';
import { UserSearchManager } from '@/components/super-admin/UserSearchManager';

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

  const integrations = useSuperAdminIntegrations();

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
          <p className="text-muted-foreground">Manage platform settings, integrations, users, and configurations</p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Limits
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <SuperAdminAnalytics />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <IntegrationOAuthManager
            secrets={integrations.integrationSecrets}
            onSave={integrations.saveIntegrationSecret}
            onDelete={integrations.deleteIntegrationSecret}
            onRefresh={integrations.refetch.integrationSecrets}
          />
          <IntegrationSecretsManager
            secrets={integrations.integrationSecrets}
            onSave={integrations.saveIntegrationSecret}
            onDelete={integrations.deleteIntegrationSecret}
            onRefresh={integrations.refetch.integrationSecrets}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <RazorpayManagement
            webhookLogs={integrations.webhookLogs}
            paymentFailures={integrations.paymentFailures}
            refundOverrides={integrations.refundOverrides}
            settlementLogs={integrations.settlementLogs}
            taxConfigurations={integrations.taxConfigurations}
            countryPaymentRules={integrations.countryPaymentRules}
            onRetryWebhook={integrations.retryWebhook}
            onResolveFailure={integrations.resolvePaymentFailure}
            onCreateRefund={integrations.createRefundOverride}
            onUpdateTax={integrations.updateTaxConfiguration}
            onUpdatePaymentRule={integrations.updateCountryPaymentRule}
            onRefresh={integrations.refetch.all}
          />
        </TabsContent>

        {/* Site Settings Tab */}
        <TabsContent value="site">
          <SiteSettingsManager
            settings={integrations.siteSettings}
            onUpdate={integrations.updateSiteSetting}
            onRefresh={integrations.refetch.siteSettings}
          />
        </TabsContent>

        {/* Users Tab - Advanced Search */}
        <TabsContent value="users">
          <UserSearchManager />
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features globally</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch.featureFlags()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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

        {/* Token Configuration Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Token Configuration</CardTitle>
                <CardDescription>Manage token packages and pricing</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch.tokenConfigs()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI System Limits</CardTitle>
                <CardDescription>Configure AI usage limits and rate limiting</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch.aiLimits()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
