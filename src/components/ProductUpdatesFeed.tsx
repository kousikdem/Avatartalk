
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Users, Package, Clock } from 'lucide-react';

const ProductUpdatesFeed = () => {
  // Mock updates data - in real app this would come from database
  const updates = [
    {
      id: '1',
      type: 'product_published',
      title: 'AI Avatar Consultation',
      description: 'Product has been published and is now live',
      timestamp: '2024-01-15T10:30:00Z',
      icon: Package,
      color: 'from-green-100 to-emerald-100 text-green-800 border-green-200'
    },
    {
      id: '2',
      type: 'price_updated',
      title: 'Voice Training Guide',
      description: 'Product price updated from $29.99 to Free',
      timestamp: '2024-01-14T16:45:00Z',
      icon: TrendingUp,
      color: 'from-blue-100 to-cyan-100 text-blue-800 border-blue-200'
    },
    {
      id: '3',
      type: 'event_scheduled',
      title: 'Premium Avatar Workshop',
      description: 'New workshop event scheduled for January 20th',
      timestamp: '2024-01-13T09:15:00Z',
      icon: Calendar,
      color: 'from-purple-100 to-violet-100 text-purple-800 border-purple-200'
    },
    {
      id: '4',
      type: 'collaboration_added',
      title: 'Brand Partnership Program',
      description: 'New collaboration opportunity added',
      timestamp: '2024-01-12T14:20:00Z',
      icon: Users,
      color: 'from-pink-100 to-rose-100 text-pink-800 border-pink-200'
    }
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-white via-slate-50/60 to-blue-50/40 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update) => {
              const IconComponent = update.icon;
              return (
                <Card key={update.id} className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 border-slate-200/60 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${update.color.includes('green') ? 'from-green-100 to-emerald-100' : update.color.includes('blue') ? 'from-blue-100 to-cyan-100' : update.color.includes('purple') ? 'from-purple-100 to-violet-100' : 'from-pink-100 to-rose-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-5 h-5 ${update.color.includes('green') ? 'text-green-600' : update.color.includes('blue') ? 'text-blue-600' : update.color.includes('purple') ? 'text-purple-600' : 'text-pink-600'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">{update.title}</h4>
                          <Badge className={`bg-gradient-to-r ${update.color} text-xs`}>
                            {update.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2">
                          {update.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(update.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductUpdatesFeed;
