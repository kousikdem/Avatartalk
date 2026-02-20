import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, Clock, 
  RefreshCw, Video, Calendar, CreditCard, ShoppingBag, Search, BarChart
} from 'lucide-react';
import { IntegrationSecret } from '@/hooks/useSuperAdminIntegrations';
import { format } from 'date-fns';

interface Props {
  secrets: IntegrationSecret[];
  onSave: (secret: Partial<IntegrationSecret>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

const INTEGRATIONS = [
  { name: 'razorpay', label: 'Razorpay', icon: CreditCard, keys: ['key_id', 'key_secret', 'webhook_secret'] },
  { name: 'google_meet', label: 'Google Meet', icon: Video, keys: ['client_id', 'client_secret'] },
  { name: 'zoom', label: 'Zoom', icon: Video, keys: ['client_id', 'client_secret', 'account_id'] },
  { name: 'google_calendar', label: 'Google Calendar', icon: Calendar, keys: ['client_id', 'client_secret'] },
  { name: 'shopify', label: 'Shopify', icon: ShoppingBag, keys: ['api_key', 'api_secret', 'access_token'] },
  { name: 'google_analytics', label: 'Google Analytics', icon: BarChart, keys: ['tracking_id', 'api_secret'] },
  { name: 'google_search_console', label: 'Google Search Console', icon: Search, keys: ['verification_code', 'api_key'] },
];

export const IntegrationSecretsManager = ({ secrets, onSave, onDelete, onRefresh }: Props) => {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingSecret, setEditingSecret] = useState<Partial<IntegrationSecret> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [environment, setEnvironment] = useState<'test' | 'live'>('live');

  const toggleShowSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (editingSecret) {
      const success = await onSave(editingSecret);
      if (success) {
        setEditingSecret(null);
        setIsDialogOpen(false);
      }
    }
  };

  const openNewSecretDialog = (integrationName: string, secretKey: string) => {
    setEditingSecret({
      integration_name: integrationName,
      secret_key: secretKey,
      secret_value: '',
      environment: environment,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const getSecretForKey = (integrationName: string, secretKey: string, env: 'test' | 'live') => {
    return secrets.find(
      s => s.integration_name === integrationName && 
           s.secret_key === secretKey && 
           s.environment === env
    );
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Integration Secrets
          </CardTitle>
          <CardDescription>Manage API keys and secrets for all platform integrations</CardDescription>
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
        <Tabs defaultValue="razorpay" className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full">
            {INTEGRATIONS.map(integration => (
              <TabsTrigger key={integration.name} value={integration.name} className="flex items-center gap-1 text-xs">
                <integration.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{integration.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {INTEGRATIONS.map(integration => (
            <TabsContent key={integration.name} value={integration.name}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <integration.icon className="h-5 w-5" />
                    {integration.label} ({environment === 'test' ? 'Test' : 'Live'} Environment)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Verified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integration.keys.map(keyName => {
                        const secret = getSecretForKey(integration.name, keyName, environment);
                        return (
                          <TableRow key={keyName}>
                            <TableCell className="font-medium">
                              {keyName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </TableCell>
                            <TableCell>
                              {secret ? (
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {showSecrets[secret.id] 
                                      ? secret.secret_value 
                                      : '••••••••••••'}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleShowSecret(secret.id)}
                                  >
                                    {showSecrets[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant="outline">Not Set</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {secret ? (
                                <div className="flex items-center gap-2">
                                  {getVerificationIcon(secret.verification_status)}
                                  <Badge variant={secret.is_active ? 'default' : 'secondary'}>
                                    {secret.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {secret?.last_verified_at 
                                ? format(new Date(secret.last_verified_at), 'MMM d, yyyy HH:mm')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (secret) {
                                      setEditingSecret(secret);
                                    } else {
                                      openNewSecretDialog(integration.name, keyName);
                                    }
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  {secret ? 'Edit' : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                                </Button>
                                {secret && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(secret.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSecret?.id ? 'Edit' : 'Add'} Secret
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Integration</Label>
                <Input value={editingSecret?.integration_name || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input value={editingSecret?.secret_key || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Secret Value</Label>
                <Input
                  type="password"
                  value={editingSecret?.secret_value || ''}
                  onChange={(e) => setEditingSecret(prev => prev ? { ...prev, secret_value: e.target.value } : null)}
                  placeholder="Enter secret value..."
                />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={editingSecret?.environment || 'live'}
                  onValueChange={(v: 'test' | 'live') => setEditingSecret(prev => prev ? { ...prev, environment: v } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingSecret?.is_active ?? true}
                  onCheckedChange={(checked) => setEditingSecret(prev => prev ? { ...prev, is_active: checked } : null)}
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                Save Secret
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
