import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, CheckCircle, XCircle, Clock, RefreshCw, Video, Calendar, 
  CreditCard, ExternalLink, Link2, Unlink, Eye, EyeOff, Settings,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IntegrationSecret } from '@/hooks/useSuperAdminIntegrations';

interface IntegrationConfig {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasOAuth: boolean;
  oauthScopes?: string[];
  secretKeys: { key: string; label: string; isSecret: boolean }[];
  description: string;
  comingSoon?: boolean;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: 'razorpay',
    label: 'Razorpay',
    icon: CreditCard,
    hasOAuth: false,
    secretKeys: [
      { key: 'key_id', label: 'Key ID', isSecret: false },
      { key: 'key_secret', label: 'Key Secret', isSecret: true },
      { key: 'webhook_secret', label: 'Webhook Secret', isSecret: true },
    ],
    description: 'Payment processing for subscriptions and products',
    comingSoon: false,
  },
  {
    name: 'google_meet',
    label: 'Google Meet',
    icon: Video,
    hasOAuth: true,
    oauthScopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    secretKeys: [
      { key: 'client_id', label: 'Client ID', isSecret: false },
      { key: 'client_secret', label: 'Client Secret', isSecret: true },
    ],
    description: 'Video meetings for virtual collaborations',
    comingSoon: true,
  },
  {
    name: 'google_calendar',
    label: 'Google Calendar',
    icon: Calendar,
    hasOAuth: true,
    oauthScopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    secretKeys: [
      { key: 'client_id', label: 'Client ID', isSecret: false },
      { key: 'client_secret', label: 'Client Secret', isSecret: true },
    ],
    description: 'Calendar sync for scheduling and events',
    comingSoon: true,
  },
  {
    name: 'zoom',
    label: 'Zoom',
    icon: Video,
    hasOAuth: true,
    oauthScopes: ['meeting:write', 'user:read'],
    secretKeys: [
      { key: 'client_id', label: 'Client ID', isSecret: false },
      { key: 'client_secret', label: 'Client Secret', isSecret: true },
      { key: 'account_id', label: 'Account ID (Server-to-Server)', isSecret: false },
    ],
    description: 'Video conferencing for virtual collaborations',
    comingSoon: false,
  },
];

interface Props {
  secrets: IntegrationSecret[];
  onSave: (secret: Partial<IntegrationSecret>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

interface IntegrationStatus {
  status: 'pending' | 'verified' | 'failed' | 'expired';
  message: string;
  connectedEmail?: string;
}

export const IntegrationOAuthManager = ({ secrets, onSave, onDelete, onRefresh }: Props) => {
  const [environment, setEnvironment] = useState<'test' | 'live'>('live');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editDialog, setEditDialog] = useState<{ open: boolean; integration: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({});
  const { toast } = useToast();

  // Platform secrets from Supabase (read-only display)
  const platformSecrets = {
    razorpay: {
      key_id: 'RAZORPAY_KEY_ID',
      key_secret: 'RAZORPAY_KEY_SECRET',
      webhook_secret: 'RAZORPAY_WEBHOOK_SECRET',
    },
    google_meet: {
      client_id: 'GOOGLE_CLIENT_ID',
      client_secret: 'GOOGLE_CLIENT_SECRET',
    },
    google_calendar: {
      client_id: 'GOOGLE_CLIENT_ID',
      client_secret: 'GOOGLE_CLIENT_SECRET',
    },
    zoom: {
      client_id: 'ZOOM_CLIENT_ID',
      client_secret: 'ZOOM_CLIENT_SECRET',
    },
  };

  useEffect(() => {
    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth_success') {
        toast({
          title: 'Connected Successfully',
          description: `${event.data.provider} has been connected${event.data.email ? ` as ${event.data.email}` : ''}.`,
        });
        onRefresh();
        verifyIntegration(event.data.provider);
      } else if (event.data.type === 'oauth_error') {
        toast({
          title: 'Connection Failed',
          description: event.data.error,
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast, onRefresh]);

  const getSecretValue = (integrationName: string, secretKey: string) => {
    const secret = secrets.find(
      s => s.integration_name === integrationName && 
           s.secret_key === secretKey && 
           s.environment === environment
    );
    return secret?.secret_value || '';
  };

  const getSecretRecord = (integrationName: string, secretKey: string) => {
    return secrets.find(
      s => s.integration_name === integrationName && 
           s.secret_key === secretKey && 
           s.environment === environment
    );
  };

  const verifyIntegration = async (integrationName: string) => {
    setVerifying(integrationName);
    try {
      const { data, error } = await supabase.functions.invoke('verify-integration', {
        body: { integration: integrationName, environment },
      });

      if (error) throw error;

      setIntegrationStatuses(prev => ({
        ...prev,
        [integrationName]: {
          status: data.status,
          message: data.message,
          connectedEmail: data.connectedEmail,
        },
      }));

      toast({
        title: data.status === 'verified' ? 'Verified' : 'Verification Issue',
        description: data.message,
        variant: data.status === 'verified' ? 'default' : 'destructive',
      });
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setVerifying(null);
    }
  };

  const initiateOAuth = (integration: IntegrationConfig) => {
    const supabaseUrl = 'https://hnxnvdzrwbtmcohdptfq.supabase.co';
    const redirectUri = `${supabaseUrl}/functions/v1/integration-oauth-callback?provider=${integration.name}`;
    
    let authUrl = '';
    
    if (integration.name === 'google_meet' || integration.name === 'google_calendar') {
      const clientId = getSecretValue(integration.name, 'client_id');
      if (!clientId) {
        toast({
          title: 'Configuration Required',
          description: 'Please configure Client ID first.',
          variant: 'destructive',
        });
        return;
      }
      
      const scopes = integration.oauthScopes?.join(' ') || '';
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent`;
    } else if (integration.name === 'zoom') {
      const clientId = getSecretValue(integration.name, 'client_id');
      if (!clientId) {
        toast({
          title: 'Configuration Required',
          description: 'Please configure Client ID first.',
          variant: 'destructive',
        });
        return;
      }
      
      authUrl = `https://zoom.us/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code`;
    }

    if (authUrl) {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(authUrl, 'oauth', `width=${width},height=${height},left=${left},top=${top}`);
    }
  };

  const disconnectOAuth = async (integrationName: string) => {
    // Remove access tokens
    const tokensToRemove = secrets.filter(
      s => s.integration_name === integrationName && 
           ['access_token', 'refresh_token', 'token_expires_at', 'connected_email'].includes(s.secret_key)
    );

    for (const token of tokensToRemove) {
      await onDelete(token.id);
    }

    setIntegrationStatuses(prev => ({
      ...prev,
      [integrationName]: { status: 'pending', message: 'Disconnected' },
    }));

    toast({
      title: 'Disconnected',
      description: `${integrationName} has been disconnected.`,
    });
  };

  const handleSaveSecret = async () => {
    if (!editDialog) return;
    
    const existingSecret = getSecretRecord(editDialog.integration, editDialog.key);
    
    const success = await onSave({
      id: existingSecret?.id,
      integration_name: editDialog.integration,
      secret_key: editDialog.key,
      secret_value: editValue,
      environment,
      is_active: true,
    });

    if (success) {
      setEditDialog(null);
      setEditValue('');
    }
  };

  const getStatusBadge = (integration: IntegrationConfig) => {
    const status = integrationStatuses[integration.name];
    const hasAccessToken = getSecretValue(integration.name, 'access_token');
    const connectedEmail = getSecretValue(integration.name, 'connected_email');

    if (status?.status === 'verified' || hasAccessToken) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
          {(connectedEmail || status?.connectedEmail) && (
            <span className="text-xs text-muted-foreground">{connectedEmail || status?.connectedEmail}</span>
          )}
        </div>
      );
    } else if (status?.status === 'expired') {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Token Expired
        </Badge>
      );
    } else if (status?.status === 'failed') {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Not Connected
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Integration Setup
          </CardTitle>
          <CardDescription>Configure OAuth and API credentials for platform integrations</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={environment} onValueChange={(v: 'test' | 'live') => setEnvironment(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Platform secrets (RAZORPAY_KEY_ID, GOOGLE_CLIENT_ID, etc.) are configured in Supabase Edge Function secrets. 
            Use this panel to manage OAuth connections and verify integrations.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="razorpay" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            {INTEGRATIONS.map(integration => (
              <TabsTrigger key={integration.name} value={integration.name} className="flex items-center gap-2">
                <integration.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{integration.label}</span>
                {integration.comingSoon && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">Soon</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {INTEGRATIONS.map(integration => (
            <TabsContent key={integration.name} value={integration.name}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <integration.icon className="h-5 w-5" />
                        {integration.label}
                        {integration.comingSoon && (
                          <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                    {!integration.comingSoon && getStatusBadge(integration)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {integration.comingSoon ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {integration.label} integration is coming soon. Stay tuned for updates!
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                  {/* Credentials Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">API Credentials</h4>
                    <div className="grid gap-4">
                      {integration.secretKeys.map(secretConfig => {
                        const value = getSecretValue(integration.name, secretConfig.key);
                        const platformSecretKey = platformSecrets[integration.name as keyof typeof platformSecrets]?.[secretConfig.key as keyof (typeof platformSecrets)[keyof typeof platformSecrets]];
                        
                        return (
                          <div key={secretConfig.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <Label className="font-medium">{secretConfig.label}</Label>
                              {platformSecretKey && (
                                <p className="text-xs text-muted-foreground">
                                  Supabase Secret: <code className="bg-muted px-1 rounded">{platformSecretKey}</code>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {value ? (
                                <>
                                  <code className="text-sm bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                                    {showSecrets[`${integration.name}-${secretConfig.key}`] 
                                      ? value 
                                      : '••••••••••••'}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSecrets(prev => ({
                                      ...prev,
                                      [`${integration.name}-${secretConfig.key}`]: !prev[`${integration.name}-${secretConfig.key}`]
                                    }))}
                                  >
                                    {showSecrets[`${integration.name}-${secretConfig.key}`] 
                                      ? <EyeOff className="h-4 w-4" /> 
                                      : <Eye className="h-4 w-4" />}
                                  </Button>
                                </>
                              ) : (
                                <Badge variant="outline">Not Set</Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditDialog({ open: true, integration: integration.name, key: secretConfig.key });
                                  setEditValue(value);
                                }}
                              >
                                {value ? 'Update' : 'Add'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* OAuth Section for applicable integrations */}
                  {integration.hasOAuth && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium text-sm text-muted-foreground">OAuth Connection</h4>
                      <div className="flex items-center gap-4">
                        {getSecretValue(integration.name, 'access_token') ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => disconnectOAuth(integration.name)}
                            >
                              <Unlink className="h-4 w-4 mr-2" />
                              Disconnect
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => initiateOAuth(integration)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reconnect
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => initiateOAuth(integration)}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect {integration.label}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => verifyIntegration(integration.name)}
                          disabled={verifying === integration.name}
                        >
                          {verifying === integration.name ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Verify
                        </Button>
                      </div>
                      {integration.oauthScopes && (
                        <p className="text-xs text-muted-foreground">
                          Required scopes: {integration.oauthScopes.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Razorpay-specific verification */}
                  {integration.name === 'razorpay' && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium text-sm text-muted-foreground">Connection Status</h4>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => verifyIntegration('razorpay')}
                          disabled={verifying === 'razorpay'}
                        >
                          {verifying === 'razorpay' ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Verify Connection
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Razorpay Dashboard
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {getSecretValue(editDialog?.integration || '', editDialog?.key || '') ? 'Update' : 'Add'} Secret
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Integration</Label>
                <Input value={editDialog?.integration || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Key</Label>
                <Input value={editDialog?.key || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="password"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter secret value..."
                />
              </div>
              <Button className="w-full" onClick={handleSaveSecret}>
                Save Secret
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
