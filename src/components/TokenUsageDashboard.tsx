import React from 'react';
import { Coins, TrendingUp, TrendingDown, MessageSquare, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTokens } from '@/hooks/useTokens';
import TokenDisplay from './TokenDisplay';

const TokenUsageDashboard: React.FC = () => {
  const { tokenBalance, events, dailyUsage, loading } = useTokens();

  const totalUsedToday = dailyUsage.find(d => 
    new Date(d.day).toDateString() === new Date().toDateString()
  )?.total_tokens || 0;

  const totalUsedThisWeek = dailyUsage
    .filter(d => {
      const date = new Date(d.day);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((sum, d) => sum + d.total_tokens, 0);

  const messagesThisWeek = dailyUsage
    .filter(d => {
      const date = new Date(d.day);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((sum, d) => sum + d.message_count, 0);

  const recentConsumptions = events.filter(e => e.reason === 'consumption').slice(0, 10);
  const recentTopups = events.filter(e => e.reason === 'topup').slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Balance */}
      <TokenDisplay />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Used Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-800">{totalUsedToday.toLocaleString()}</p>
            <p className="text-xs text-blue-600">tokens consumed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-800">{totalUsedThisWeek.toLocaleString()}</p>
            <p className="text-xs text-purple-600">tokens used</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-800">{messagesThisWeek}</p>
            <p className="text-xs text-emerald-600">this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Consumption History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Recent Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentConsumptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No usage history yet
                </p>
              ) : (
                recentConsumptions.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-100">
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {Math.abs(event.change)} tokens
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.input_tokens && event.output_tokens
                            ? `In: ${event.input_tokens} | Out: ${event.output_tokens}`
                            : 'AI Response'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.created_at)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {event.model || 'AI'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top-up History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Recent Top-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentTopups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No top-up history yet
                </p>
              ) : (
                recentTopups.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-100">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-700">
                          +{event.change.toLocaleString()} tokens
                        </p>
                        <p className="text-xs text-emerald-600">
                          Balance: {event.balance_after.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Usage Chart */}
      {dailyUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              Daily Token Usage (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {dailyUsage.slice(0, 7).reverse().map((day, index) => {
                const maxTokens = Math.max(...dailyUsage.slice(0, 7).map(d => d.total_tokens)) || 1;
                const height = (day.total_tokens / maxTokens) * 100;
                const dayName = new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={day.day} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-amber-400 to-yellow-400 rounded-t-md transition-all hover:from-amber-500 hover:to-yellow-500"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${day.total_tokens} tokens`}
                    />
                    <p className="text-xs text-muted-foreground mt-2">{dayName}</p>
                    <p className="text-xs font-medium">{day.total_tokens}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenUsageDashboard;
