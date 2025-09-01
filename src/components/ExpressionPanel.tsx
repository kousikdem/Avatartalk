
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, Frown, Meh, Heart, Zap, AlertTriangle } from 'lucide-react';

interface ExpressionPanelProps {
  currentExpression: string;
  onExpressionSelect: (expression: string) => void;
}

const ExpressionPanel: React.FC<ExpressionPanelProps> = ({ currentExpression, onExpressionSelect }) => {
  const expressions = [
    { id: 'neutral', name: 'Neutral', icon: Meh, color: 'bg-gray-500' },
    { id: 'smiling', name: 'Happy', icon: Smile, color: 'bg-yellow-500' },
    { id: 'sad', name: 'Sad', icon: Frown, color: 'bg-blue-500' },
    { id: 'angry', name: 'Angry', icon: Zap, color: 'bg-red-500' },
    { id: 'surprised', name: 'Surprised', icon: AlertTriangle, color: 'bg-orange-500' },
    { id: 'loving', name: 'Loving', icon: Heart, color: 'bg-pink-500' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Smile className="w-4 h-4" />
          Facial Expressions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {expressions.map((expression) => {
            const IconComponent = expression.icon;
            return (
              <Button
                key={expression.id}
                variant={currentExpression === expression.id ? "default" : "outline"}
                className={`h-16 flex flex-col items-center gap-1 ${
                  currentExpression === expression.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
                onClick={() => onExpressionSelect(expression.id)}
              >
                <div className={`w-6 h-6 rounded-full ${expression.color} flex items-center justify-center`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs">{expression.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpressionPanel;
