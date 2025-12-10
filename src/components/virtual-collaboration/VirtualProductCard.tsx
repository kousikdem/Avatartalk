import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, Users, Video, Edit, Trash2, Eye, 
  MoreVertical, Copy, Play, Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VirtualProduct } from '@/hooks/useVirtualProducts';

interface VirtualProductCardProps {
  product: VirtualProduct;
  onEdit: (product: VirtualProduct) => void;
  onDelete: (id: string) => void;
  onView: (product: VirtualProduct) => void;
  onDuplicate: (product: VirtualProduct) => void;
  onToggleStatus: (product: VirtualProduct) => void;
}

const VirtualProductCard: React.FC<VirtualProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onToggleStatus
}) => {
  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'one_to_one': '1:1 Meeting',
      'one_to_many': 'Webinar/Event',
      'brand_collaboration': 'Brand Collab',
      'recurring_series': 'Recurring',
      'on_demand': 'On Demand'
    };
    return labels[type] || type;
  };

  const getProductTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'one_to_one': 'bg-blue-100 text-blue-800 border-blue-200',
      'one_to_many': 'bg-purple-100 text-purple-800 border-purple-200',
      'brand_collaboration': 'bg-pink-100 text-pink-800 border-pink-200',
      'recurring_series': 'bg-green-100 text-green-800 border-green-200',
      'on_demand': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProviderIcon = (provider: string) => {
    if (provider === 'zoom') {
      return <Video className="w-3 h-3 text-blue-500" />;
    }
    return <Video className="w-3 h-3 text-green-500" />;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/60 to-blue-50/40 border-slate-200/60 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100">
            {product.thumbnail_url ? (
              <img 
                src={product.thumbnail_url} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-8 h-8 text-blue-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate">{product.title}</h3>
                {product.tagline && (
                  <p className="text-sm text-slate-600 truncate">{product.tagline}</p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(product)}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(product)}>
                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                    {product.status === 'published' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" /> Publish
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(product.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getProductTypeColor(product.product_type)}>
                {getProductTypeLabel(product.product_type)}
              </Badge>
              <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                {product.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getProviderIcon(product.meeting_provider)}
                {product.meeting_provider === 'zoom' ? 'Zoom' : 'Google Meet'}
              </Badge>
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.duration_mins} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {product.capacity} {product.capacity === 1 ? 'seat' : 'seats'}
              </span>
              <span className="font-semibold text-slate-900">
                {product.price_model === 'free' 
                  ? 'Free' 
                  : formatCurrency(product.price, product.currency)
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualProductCard;
