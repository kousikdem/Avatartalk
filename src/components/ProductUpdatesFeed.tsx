
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar, Users, DollarSign, Eye } from 'lucide-react';

const ProductUpdatesFeed = () => {
  const updates = [
    {
      id: '1',
      type: 'product_published',
      title: 'Product Published',
      description: 'AI Avatar Consultation is now live and available for booking',
      productName: 'AI Avatar Consultation',
      timestamp: '2 hours ago',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: '2',
      type: 'price_updated',
      title: 'Price Updated',
      description: 'Voice Training Guide price changed from $29.99 to Free',
      productName: 'Voice Training Guide',
      timestamp: '5 hours ago',
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '3',
      type: 'event_scheduled',
      title: 'Event Scheduled',
      description: 'Live demo session added to Premium Avatar Collection',
      productName: 'Premium Avatar Collection',
      timestamp: '1 day ago',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: '4',
      type: 'collaboration_added',
      title: 'Collaboration Added',
      description: 'New partnership with TechCorp for enterprise avatars',
      productName: 'Enterprise Solutions',
      timestamp: '2 days ago',
      icon: Users,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: '5',
      type: 'views_milestone',
      title: 'Views Milestone',
      description: 'AI Avatar Consultation reached 100 views',
      productName: 'AI Avatar Consultation',
      timestamp: '3 days ago',
      icon: Eye,
      color: 'text-indigo-600 bg-indigo-100'
    }
  ];

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'product_published': return 'Published';
      case 'price_updated': return 'Price Change';
      case 'event_scheduled': return 'Event';
      case 'collaboration_added': return 'Collaboration';
      case 'views_milestone': return 'Milestone';
      default: return 'Update';
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          Recent Product Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="flex items-start gap-4 p-4 bg-white/80 rounded-lg border border-slate-200/60 hover:bg-white/90 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${update.color}`}>
                <update.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-slate-900">{update.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getUpdateTypeLabel(update.type)}
                    </Badge>
                    <span className="text-xs text-slate-500">{update.timestamp}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-2">
                  {update.description}
                </p>
                
                <div className="text-xs font-medium text-slate-700">
                  {update.productName}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Updates
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductUpdatesFeed;
