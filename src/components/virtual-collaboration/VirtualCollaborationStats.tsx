import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Calendar, CheckCircle, Users } from 'lucide-react';

interface StatsProps {
  stats: {
    totalProducts: number;
    totalSales: number;
    totalEarnings: number;
    totalProfit: number;
    upcomingMeetings: number;
    completedMeetings: number;
  };
  currency?: string;
}

const VirtualCollaborationStats: React.FC<StatsProps> = ({ stats, currency = 'INR' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Total Profit (90%)',
      value: formatCurrency(stats.totalProfit),
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingMeetings,
      icon: Calendar,
      color: 'from-cyan-500 to-teal-500',
      bgColor: 'from-cyan-50 to-teal-50',
      borderColor: 'border-cyan-200'
    },
    {
      title: 'Completed',
      value: stats.completedMeetings,
      icon: CheckCircle,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className={`bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-600 truncate">{stat.title}</p>
                <p className="text-lg font-bold text-slate-900 truncate">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VirtualCollaborationStats;
