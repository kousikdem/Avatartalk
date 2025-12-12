import React, { useState } from 'react';
import { Coins, Plus, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTokens } from '@/hooks/useTokens';
import TokenPurchaseModal from './TokenPurchaseModal';

interface TokenDisplayProps {
  compact?: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ compact = false }) => {
  const { tokenBalance, loading } = useTokens();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const getBalanceColor = () => {
    if (tokenBalance <= 100) return 'text-red-500';
    if (tokenBalance <= 500) return 'text-amber-500';
    return 'text-emerald-500';
  };

  if (compact) {
    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:from-amber-100 hover:to-yellow-100"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span className={`font-semibold ${getBalanceColor()}`}>
                {loading ? '...' : formatTokens(tokenBalance)}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Token Balance</p>
                  <p className={`text-xl font-bold ${getBalanceColor()}`}>
                    {tokenBalance.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {tokenBalance <= 500 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs">
                  <TrendingDown className="w-4 h-4" />
                  <span>Low balance! Top up to continue chatting.</span>
                </div>
              )}
              
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                <Plus className="w-4 h-4" />
                Buy Tokens
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <TokenPurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
        <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg">
          <Coins className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">AI Tokens</span>
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Balance
            </Badge>
          </div>
          <p className={`text-2xl font-bold ${getBalanceColor()}`}>
            {loading ? '...' : tokenBalance.toLocaleString()}
          </p>
        </div>
        
        <Button
          onClick={() => setShowPurchaseModal(true)}
          className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Buy Tokens
        </Button>
      </div>
      
      <TokenPurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
      />
    </>
  );
};

export default TokenDisplay;
