import React from 'react';
import { useCurrency, CURRENCIES, Currency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { RefreshCw, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  compact?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ compact = false }) => {
  const { currency, setCurrency, loading, lastUpdated, refreshRates, getCurrencyInfo } = useCurrency();
  const currentInfo = getCurrencyInfo();

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Not updated';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={compact ? "sm" : "default"}
          className={cn(
            "border-primary/30 hover:border-primary/50 hover:bg-primary/5",
            compact ? "h-8 px-2 text-xs" : "px-3"
          )}
        >
          <Globe className={cn("text-primary", compact ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2")} />
          <span className="font-medium">{currentInfo.symbol}</span>
          <span className={cn("ml-1 text-muted-foreground", compact && "hidden sm:inline")}>
            {currency}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Select Currency</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              refreshRates();
            }}
            disabled={loading}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", loading && "animate-spin")} />
            {formatLastUpdated()}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CURRENCIES.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code as Currency)}
            className={cn(
              "cursor-pointer flex items-center justify-between",
              currency === curr.code && "bg-primary/10"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-medium">{curr.symbol}</span>
              <span>{curr.code}</span>
              <span className="text-muted-foreground text-xs">- {curr.name}</span>
            </div>
            {currency === curr.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
