import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Calendar, Cloud, Package, Loader2 } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import IntegrationCard from './IntegrationCard';

const INTEGRATION_PROVIDERS = [
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Create and manage Zoom meetings directly from your profile',
    icon: Video,
    color: 'from-blue-500 to-blue-600',
    category: 'meetings',
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    description: 'Schedule Google Meet sessions via Google Calendar',
    icon: Video,
    color: 'from-green-500 to-green-600',
    category: 'meetings',
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    description: 'Connect your Microsoft Teams for scheduling',
    icon: Video,
    color: 'from-purple-500 to-purple-600',
    category: 'meetings',
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Embed Calendly booking links on your profile',
    icon: Calendar,
    color: 'from-blue-400 to-cyan-500',
    category: 'calendar',
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Display and share files from Google Drive',
    icon: Cloud,
    color: 'from-yellow-500 to-orange-500',
    category: 'storage',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync and display Dropbox files',
    icon: Cloud,
    color: 'from-blue-600 to-blue-700',
    category: 'storage',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Access and share OneDrive files',
    icon: Cloud,
    color: 'from-blue-500 to-indigo-600',
    category: 'storage',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Display and sell products from your Shopify store',
    icon: Package,
    color: 'from-green-600 to-emerald-700',
    category: 'commerce',
  },
];

const IntegrationsTab: React.FC = () => {
  const { integrations, loading, connectIntegration, disconnectIntegration, updateSettings } = useIntegrations();

  const getIntegration = (providerId: string) => {
    return integrations.find(i => i.provider === providerId);
  };

  const renderCategory = (category: string) => {
    const categoryProviders = INTEGRATION_PROVIDERS.filter(p => p.category === category);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryProviders.map((provider) => (
          <IntegrationCard
            key={provider.id}
            provider={provider}
            integration={getIntegration(provider.id)}
            onConnect={connectIntegration}
            onDisconnect={disconnectIntegration}
            onUpdateSettings={updateSettings}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your meeting, calendar, file storage, and store services to display on your avatar profile and enable scheduling & import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meetings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meetings">
                <Video className="w-4 h-4 mr-2" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="storage">
                <Cloud className="w-4 h-4 mr-2" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="commerce">
                <Package className="w-4 h-4 mr-2" />
                Commerce
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meetings" className="space-y-4">
              {renderCategory('meetings')}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              {renderCategory('calendar')}
            </TabsContent>

            <TabsContent value="storage" className="space-y-4">
              {renderCategory('storage')}
            </TabsContent>

            <TabsContent value="commerce" className="space-y-4">
              {renderCategory('commerce')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Overview of your connected integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Total integrations: <span className="font-semibold">{integrations.length}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Connected: <span className="font-semibold text-green-600">
                {integrations.filter(i => i.connected).length}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Disconnected: <span className="font-semibold text-gray-600">
                {integrations.filter(i => !i.connected).length}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;
