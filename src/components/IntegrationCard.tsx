import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Integration } from '@/hooks/useIntegrations';
import { format } from 'date-fns';
import IntegrationSettings from './IntegrationSettings';

interface IntegrationCardProps {
  provider: {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
  };
  integration?: Integration;
  onConnect: (provider: string) => Promise<void>;
  onDisconnect: (integrationId: string, provider: string) => Promise<void>;
  onUpdateSettings: (integrationId: string, settings: any) => Promise<void>;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  provider,
  integration,
  onConnect,
  onDisconnect,
  onUpdateSettings,
}) => {
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const Icon = provider.icon;

  const handleConnect = async () => {
    setLoading(true);
    try {
      await onConnect(provider.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration) return;
    setLoading(true);
    try {
      await onDisconnect(integration.id, provider.name);
      setSettingsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = integration?.expires_at && 
    new Date(integration.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${provider.color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
            </div>
          </div>
          
          {integration?.connected && (
            <Badge variant={isExpiringSoon ? "destructive" : "default"} className="ml-2">
              {isExpiringSoon ? (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Expires Soon
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {integration?.connected && (
          <div className="text-sm text-muted-foreground space-y-1">
            {integration.updated_at && (
              <p>Last sync: {format(new Date(integration.updated_at), 'MMM dd, yyyy HH:mm')}</p>
            )}
            {integration.expires_at && (
              <p>Expires: {format(new Date(integration.expires_at), 'MMM dd, yyyy')}</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!integration?.connected ? (
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect {provider.name}
            </Button>
          ) : (
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {provider.name} Settings
                  </SheetTitle>
                </SheetHeader>
                
                <IntegrationSettings
                  provider={provider}
                  integration={integration}
                  onUpdateSettings={onUpdateSettings}
                  onDisconnect={handleDisconnect}
                  loading={loading}
                />
              </SheetContent>
            </Sheet>
          )}

          {integration?.connected && isExpiringSoon && (
            <Button
              onClick={handleConnect}
              disabled={loading}
              variant="default"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reconnect
            </Button>
          )}
        </div>

        {provider.id === 'shopify' && integration?.connected && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => window.open(`https://${integration.connection_data?.shop_domain}/admin`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Store Admin
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
