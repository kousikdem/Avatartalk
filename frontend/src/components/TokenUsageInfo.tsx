import React from 'react';
import { Info, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TokenUsageInfoProps {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  remainingBalance?: number;
  compact?: boolean;
}

const TokenUsageInfo: React.FC<TokenUsageInfoProps> = ({
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = 0,
  remainingBalance,
  compact = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="text-xs cursor-help bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            >
              <Zap className="w-3 h-3 mr-1" />
              {totalTokens} tokens
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="p-3 max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Token Usage</p>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input:</span>
                  <span>{inputTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output:</span>
                  <span>{outputTokens}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>Total:</span>
                  <span>{totalTokens}</span>
                </div>
                {remainingBalance !== undefined && (
                  <div className="flex justify-between text-amber-600 pt-1">
                    <span>Remaining:</span>
                    <span>{remainingBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-3 h-3" />
          <span>{totalTokens} tokens used</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Input tokens:</span>
            <span className="font-medium">{inputTokens}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Output tokens:</span>
            <span className="font-medium">{outputTokens}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-amber-600">{totalTokens} tokens</span>
          </div>
          {remainingBalance !== undefined && (
            <div className="flex justify-between text-emerald-600">
              <span>Remaining balance:</span>
              <span className="font-medium">{remainingBalance.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TokenUsageInfo;