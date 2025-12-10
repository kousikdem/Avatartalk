import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Video, Calendar, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { HostIntegration } from '@/hooks/useVirtualProducts';

interface IntegrationBarProps {
  integrations: HostIntegration | null;
  onConnectGoogle: () => void;
  onConnectZoom: () => void;
  onSyncCalendar: () => void;
  isSyncing?: boolean;
}

const IntegrationBar: React.FC<IntegrationBarProps> = ({
  integrations,
  onConnectGoogle,
  onConnectZoom,
  onSyncCalendar,
  isSyncing = false
}) => {
  const googleConnected = integrations?.google_connected || false;
  const zoomConnected = integrations?.zoom_connected || false;
  const calendarSyncEnabled = integrations?.calendar_sync_enabled || false;

  return (
    <Card className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 border-slate-200/60">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Integrations:</span>
        
        {/* Google (Meet + Calendar) */}
        <div className="flex items-center gap-2">
          <Button
            variant={googleConnected ? "outline" : "default"}
            size="sm"
            onClick={onConnectGoogle}
            className={googleConnected 
              ? "bg-green-50 border-green-200 hover:bg-green-100" 
              : "bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white"
            }
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleConnected ? 'Google Connected' : 'Connect Google'}
          </Button>
          {googleConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              {integrations?.google_email || 'Connected'}
            </Badge>
          )}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <Button
            variant={zoomConnected ? "outline" : "default"}
            size="sm"
            onClick={onConnectZoom}
            className={zoomConnected 
              ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            }
          >
            <Video className="w-4 h-4 mr-2" />
            {zoomConnected ? 'Zoom Connected' : 'Connect Zoom'}
          </Button>
          {zoomConnected && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              {integrations?.zoom_email || 'Connected'}
            </Badge>
          )}
        </div>

        {/* Calendar Sync */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncCalendar}
            disabled={!googleConnected || isSyncing}
            className={calendarSyncEnabled 
              ? "bg-purple-50 border-purple-200 hover:bg-purple-100" 
              : ""
            }
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            {calendarSyncEnabled ? 'Calendar Synced' : 'Sync Calendar'}
          </Button>
          
          {integrations?.last_sync_at && (
            <span className="text-xs text-slate-500">
              Last sync: {new Date(integrations.last_sync_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default IntegrationBar;
